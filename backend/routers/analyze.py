import asyncio
import json
import mimetypes
import os
import time
import tempfile
import uuid
from urllib.parse import quote

import aiofiles
import cv2
from fastapi import APIRouter, BackgroundTasks, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel

from analyzer import detect_impact_frame, generate_pose_video, run_analysis

router = APIRouter()
_results = {}

BACKEND_DIR = os.path.dirname(os.path.dirname(__file__))
REF_DB_DIR = os.path.join(BACKEND_DIR, 'reference_db')
REFERENCE_VIDEO_DIR = os.path.join(REF_DB_DIR, 'videos')
UPLOAD_DIR = os.path.join(tempfile.gettempdir(), 'swing-mirror')
GENERATED_DIR = os.path.join(UPLOAD_DIR, 'generated')
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(GENERATED_DIR, exist_ok=True)

PLAYERS = {
    'ohtani': {'name': 'Shohei Ohtani', 'ref': '오타니_keypoints.json', 'league': 'MLB'},
    'lee_seung_yeop': {'name': 'Lee Seung-yeop', 'ref': '이승엽_keypoints.json', 'league': 'KBO'},
    'lee_dae_ho': {'name': 'Lee Dae-ho', 'ref': '이대호_keypoints.json', 'league': 'KBO'},
    'kim_tae_kyun': {'name': 'Kim Tae-kyun', 'ref': '김태균_keypoints.json', 'league': 'KBO'},
    'park_byung_ho': {'name': 'Park Byung-ho', 'ref': '박병호_keypoints.json', 'league': 'KBO'},
    'park_yong_taik': {'name': 'Park Yong-taik', 'ref': '박용택_keypoints.json', 'league': 'KBO'},
    'yang_eui_ji': {'name': 'Yang Eui-ji', 'ref': '양의지_keypoints.json', 'league': 'KBO'},
    'lee_jong_beom': {'name': 'Lee Jong-beom', 'ref': '이종범_keypoints.json', 'league': 'KBO'},
    'choi_jeong': {'name': 'Choi Jeong', 'ref': '최정_keypoints.json', 'league': 'KBO'},
    'ahn_hyeon_min': {'name': 'Ahn Hyeon-min', 'ref': '안현민_keypoints.json', 'league': 'KBO'},
    'park_min_woo': {'name': 'Park Min-woo', 'ref': '박민우_keypoints.json', 'league': 'KBO'},
    'lee_jung_hoo': {'name': 'Lee Jung-hoo', 'ref': '이정후_keypoints.json', 'league': 'MLB'},
}


def _reference_video_filename(ref_filename: str) -> str:
    player_name = ref_filename.removesuffix('_keypoints.json')
    expected_stem = f'{player_name}_Sports2D_output'

    for ext in ('.mp4', '.mov', '.m4v', '.webm'):
        filename = f'{expected_stem}{ext}'
        if os.path.exists(os.path.join(REFERENCE_VIDEO_DIR, filename)):
            return filename

    if not os.path.isdir(REFERENCE_VIDEO_DIR):
        return ''

    for filename in os.listdir(REFERENCE_VIDEO_DIR):
        stem, ext = os.path.splitext(filename)
        if stem == expected_stem and ext.lower() in {'.mp4', '.mov', '.m4v', '.webm'}:
            return filename

    return ''


def _reference_video_url(ref_filename: str) -> str:
    filename = _reference_video_filename(ref_filename)
    if not filename:
        return ''
    return f'/api/reference-videos/{quote(filename, safe="")}'


def _reference_video_stream_url(ref_filename: str) -> str:
    filename = _reference_video_filename(ref_filename)
    if not filename:
        return ''
    return f'/api/reference-video-streams/{quote(filename, safe="")}'


class AnalysisResponse(BaseModel):
    job_id: str
    status: str
    impact_frame: int = -1
    comparison: dict = {}
    metric_feedback: dict = {}
    metric_feedback_error: str = ''
    feedback: str = ''
    reference_video_url: str = ''
    reference_video_stream_url: str = ''
    skeleton_video_url: str = ''
    skeleton_video_meta: dict = {}
    reference_player: str = ''
    user_handed: str = ''
    reference_handed: str = ''
    progress_stage: str = 'waiting'
    progress_message: str = ''
    error: str = ''


async def _run_in_background(job_id: str, video_path: str, ref_json: str, frame: int, user_handed: str):
    try:
        ref_filename = os.path.basename(ref_json)
        reference_video_url = _reference_video_url(ref_filename)
        reference_video_stream_url = _reference_video_stream_url(ref_filename)

        def set_progress(stage: str, message: str):
            _results.setdefault(job_id, {'status': 'processing'})
            _results[job_id].update({
                'progress_stage': stage,
                'progress_message': message,
            })

        skeleton_filename = f'skeleton_{job_id}.mp4'
        skeleton_path = os.path.join(GENERATED_DIR, skeleton_filename)
        skeleton_url = ''
        skeleton_meta = {}

        try:
            set_progress('pose', '포즈 감지 중')
            skeleton_meta = await asyncio.to_thread(generate_pose_video, video_path, skeleton_path)
            skeleton_url = f'/api/generated/{skeleton_filename}'
            _results[job_id].update({
                'skeleton_video_url': skeleton_url,
                'skeleton_video_meta': skeleton_meta,
            })
        except Exception as skeleton_exc:
            _results[job_id].update({'skeleton_video_error': str(skeleton_exc)})

        set_progress('angles', '각도 계산 중')
        result = await asyncio.to_thread(run_analysis, video_path, ref_json, frame, user_handed, set_progress)

        _results[job_id] = {
            'status': 'done',
            **result,
            'reference_video_url': reference_video_url,
            'reference_video_stream_url': reference_video_stream_url,
        }
        if skeleton_url:
            _results[job_id].update({
                'skeleton_video_url': skeleton_url,
                'skeleton_video_meta': skeleton_meta,
            })
        _results[job_id].update({
            'progress_stage': 'done',
            'progress_message': '분석 완료',
        })
    except Exception as exc:
        _results[job_id] = {'status': 'error', 'error': str(exc)}
    finally:
        if os.path.exists(video_path):
            os.remove(video_path)


@router.get('/health')
def health():
    return {'status': 'ok', 'message': 'SwingMirror analysis server is running.'}


@router.get('/generated/{filename}')
def get_generated_file(filename: str):
    safe_name = os.path.basename(filename)
    path = os.path.join(GENERATED_DIR, safe_name)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail='Generated file not found.')

    return FileResponse(path, media_type='video/mp4')


@router.get('/reference-videos/{filename}')
def get_reference_video(filename: str):
    safe_name = os.path.basename(filename)
    path = os.path.join(REFERENCE_VIDEO_DIR, safe_name)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail='Reference video not found.')

    media_type = mimetypes.guess_type(path)[0] or 'video/mp4'
    return FileResponse(path, media_type=media_type)


@router.get('/reference-video-streams/{filename}')
def get_reference_video_stream(filename: str):
    safe_name = os.path.basename(filename)
    path = os.path.join(REFERENCE_VIDEO_DIR, safe_name)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail='Reference video not found.')

    def frame_stream():
        cap = cv2.VideoCapture(path)
        if not cap.isOpened():
            return

        fps = cap.get(cv2.CAP_PROP_FPS) or 24
        delay = 1 / max(1, min(fps, 30))

        try:
            while True:
                ok, frame = cap.read()
                if not ok:
                    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    continue

                ok, encoded = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 82])
                if not ok:
                    continue

                yield (
                    b'--frame\r\n'
                    b'Content-Type: image/jpeg\r\n\r\n'
                    + encoded.tobytes()
                    + b'\r\n'
                )
                time.sleep(delay)
        finally:
            cap.release()

    return StreamingResponse(
        frame_stream(),
        media_type='multipart/x-mixed-replace; boundary=frame',
    )


@router.get('/players')
def get_players():
    players = []
    for player_id, info in PLAYERS.items():
        ref_path = os.path.join(REF_DB_DIR, info['ref'])
        handed = ''
        if os.path.exists(ref_path):
            with open(ref_path, 'r', encoding='utf-8') as f:
                handed = json.load(f).get('handed', '')

        players.append({
            'id': player_id,
            'name': info['name'],
            'league': info['league'],
            'has_data': os.path.exists(ref_path),
            'handed': handed,
            'reference_video_url': _reference_video_url(info['ref']),
            'reference_video_stream_url': _reference_video_stream_url(info['ref']),
        })
    return players


@router.post('/analyze')
async def analyze(
    background_tasks: BackgroundTasks,
    video: UploadFile = File(...),
    player_id: str = Form(...),
    impact_frame: int = Form(-1),
    user_handed: str = Form('right'),
):
    if player_id not in PLAYERS:
        raise HTTPException(status_code=400, detail=f'Unknown player_id: {player_id}')
    if user_handed not in {'left', 'right'}:
        raise HTTPException(status_code=400, detail='user_handed must be left or right.')

    ref_json = os.path.join(REF_DB_DIR, PLAYERS[player_id]['ref'])
    if not os.path.exists(ref_json):
        raise HTTPException(status_code=404, detail=f'Reference data not found: {PLAYERS[player_id]["ref"]}')

    job_id = str(uuid.uuid4())
    ext = os.path.splitext(video.filename or '')[1].lower() or '.mp4'
    tmp_path = os.path.join(UPLOAD_DIR, f'swing_{job_id}{ext}')

    async with aiofiles.open(tmp_path, 'wb') as out:
        await out.write(await video.read())

    _results[job_id] = {
        'status': 'processing',
        'progress_stage': 'pose',
        'progress_message': '포즈 감지 중',
        'user_handed': user_handed,
        'reference_video_url': _reference_video_url(PLAYERS[player_id]['ref']),
        'reference_video_stream_url': _reference_video_stream_url(PLAYERS[player_id]['ref']),
    }
    background_tasks.add_task(_run_in_background, job_id, tmp_path, ref_json, impact_frame, user_handed)
    return {'job_id': job_id, 'status': 'processing'}


@router.get('/result/{job_id}', response_model=AnalysisResponse)
def get_result(job_id: str):
    job = _results.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail='Analysis job not found.')

    return AnalysisResponse(
        job_id=job_id,
        status=job.get('status', 'processing'),
        impact_frame=job.get('impact_frame', -1),
        comparison=job.get('comparison', {}),
        metric_feedback=job.get('metric_feedback', {}),
        metric_feedback_error=job.get('metric_feedback_error', ''),
        feedback=job.get('feedback', ''),
        reference_video_url=job.get('reference_video_url', ''),
        reference_video_stream_url=job.get('reference_video_stream_url', ''),
        skeleton_video_url=job.get('skeleton_video_url', ''),
        skeleton_video_meta=job.get('skeleton_video_meta', {}),
        reference_player=job.get('reference_player', ''),
        user_handed=job.get('user_handed', ''),
        reference_handed=job.get('reference_handed', ''),
        progress_stage=job.get('progress_stage', 'waiting'),
        progress_message=job.get('progress_message', ''),
        error=job.get('error', ''),
    )


@router.post('/detect-impact')
async def detect_impact(video: UploadFile = File(...)):
    tmp_path = os.path.join(UPLOAD_DIR, f'detect_{uuid.uuid4()}.mp4')
    async with aiofiles.open(tmp_path, 'wb') as out:
        await out.write(await video.read())

    try:
        frame = await asyncio.to_thread(detect_impact_frame, tmp_path)
        return {'impact_frame': frame, 'detected': frame != -1}
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

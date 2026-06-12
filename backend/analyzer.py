"""
SwingMirror ???ㅼ쐷 遺꾩꽍 ?붿쭊
================================
swing_analysis.ipynb ??踰꾩쟾2 濡쒖쭅??FastAPI?먯꽌 ?????덈룄濡?紐⑤뱢??

ipynb ?????뚯씪 蹂寃??ы빆:
  - Jupyter 異쒕젰 肄붾뱶(print, plt.show) ?쒓굅
  - API_KEY瑜??섍꼍蹂??.env)?먯꽌 ?쎈룄濡?蹂寃?  - ?⑥닔蹂꾨줈 ?덉쇅 泥섎━ 異붽?
  - 寃곌낵瑜?dict濡?諛섑솚 (JSON 吏곷젹??媛??
"""

import cv2
import mediapipe as mp
import numpy as np
import math
import json
import os
import re
from pathlib import Path
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")

# ?? MediaPipe 珥덇린????
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
mp_styles = mp.solutions.drawing_styles

# ?? 愿???몃뜳?????대쫫 留ㅽ븨 (ipynb Cell 16 洹몃?濡? ??
LANDMARK_NAMES = {
    0:  "nose",
    11: "left_shoulder",
    12: "right_shoulder",
    13: "left_elbow",
    14: "right_elbow",
    15: "left_wrist",
    16: "right_wrist",
    23: "left_hip",
    24: "right_hip",
    25: "left_knee",
    26: "right_knee",
    27: "left_ankle",
    28: "right_ankle",
}

# Angle configs are selected by batting direction.
# left/right mean batter side, not MediaPipe's body-side labels.
ANGLE_CONFIGS_LEFT = {
    "lead_elbow_angle":    ("left_shoulder",  "left_elbow",    "left_wrist",  "Attack Angle"),
    "rear_elbow_angle":    ("right_shoulder", "right_elbow",   "right_wrist", "Bat Speed"),
    "lead_shoulder_angle": ("left_elbow",     "left_shoulder", "left_hip",    "Swing Path Tilt"),
    "hip_angle":           ("left_hip",       "right_hip",     "right_knee",  "Intercept Point"),
}

ANGLE_CONFIGS_RIGHT = {
    "lead_elbow_angle":    ("right_shoulder", "right_elbow",    "right_wrist", "Attack Angle"),
    "rear_elbow_angle":    ("left_shoulder",  "left_elbow",     "left_wrist",  "Bat Speed"),
    "lead_shoulder_angle": ("right_elbow",    "right_shoulder", "right_hip",   "Swing Path Tilt"),
    "hip_angle":           ("right_hip",      "left_hip",       "left_knee",   "Intercept Point"),
}


def get_angle_configs(handed: str) -> dict:
    if handed not in {"left", "right"}:
        raise ValueError("타격 방향은 left 또는 right 여야 합니다.")
    return ANGLE_CONFIGS_LEFT if handed == "left" else ANGLE_CONFIGS_RIGHT

# ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧
# STEP 1 ???꾪뙥???꾨젅???먮룞 媛먯? (踰꾩쟾1)
# ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧
def detect_impact_frame(video_path: str) -> int:
    """
    ?먮ぉ ?띾룄 ?쇳겕瑜?湲곗??쇰줈 ?꾪뙥???꾨젅?꾩쓣 ?먮룞 媛먯??⑸땲??
    (ipynb 踰꾩쟾1 濡쒖쭅)
    媛먯? ?ㅽ뙣 ??-1 諛섑솚
    """
    prev_wrist = None
    wrist_vels = []

    with mp_pose.Pose(
        static_image_mode=False,
        model_complexity=1,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
    ) as pose:
        cap = cv2.VideoCapture(video_path)
        frame_idx = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            results = pose.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            if results.pose_landmarks:
                lm = results.pose_landmarks.landmark
                wrist = (
                    (lm[15].x + lm[16].x) / 2,
                    (lm[15].y + lm[16].y) / 2,
                )
                if prev_wrist:
                    vel = math.sqrt(
                        (wrist[0] - prev_wrist[0]) ** 2 +
                        (wrist[1] - prev_wrist[1]) ** 2
                    )
                    wrist_vels.append((frame_idx, vel))
                prev_wrist = wrist
            frame_idx += 1

        cap.release()

    if not wrist_vels:
        return -1

    return max(wrist_vels, key=lambda x: x[1])[0]


# ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧
# STEP 2 ???꾪뙥???꾨젅???ㅽ룷?명듃 異붿텧
# ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧
def extract_keypoints(video_path: str, frame_idx: int) -> dict:
    """
    吏?뺥븳 ?꾨젅?꾩뿉??MediaPipe濡?愿??醫뚰몴瑜?異붿텧?⑸땲??
    (ipynb Cell 19 洹몃?濡?

    Returns:
        keypoints: { "left_shoulder": {x, y, z, visibility, px, py}, ... }
    """
    cap = cv2.VideoCapture(video_path)
    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
    ret, frame_bgr = cap.read()
    cap.release()

    if not ret or frame_bgr is None:
        raise ValueError(f"{frame_idx}번 프레임을 읽을 수 없습니다. 영상을 확인해주세요.")

    h, w = frame_bgr.shape[:2]

    with mp_pose.Pose(
        static_image_mode=True,
        model_complexity=2,
        min_detection_confidence=0.5,
    ) as pose:
        results = pose.process(cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB))

    if results.pose_landmarks is None:
        raise ValueError("포즈를 감지하지 못했습니다. 영상 각도와 조명을 확인해주세요.")

    keypoints = {}
    for idx, name in LANDMARK_NAMES.items():
        lm = results.pose_landmarks.landmark[idx]
        keypoints[name] = {
            "x":          round(lm.x, 6),
            "y":          round(lm.y, 6),
            "z":          round(lm.z, 6),
            "visibility": round(lm.visibility, 4),
            "px":         int(lm.x * w),
            "py":         int(lm.y * h),
        }

    return keypoints


# ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧
# STEP 3 ??媛곷룄 怨꾩궛 諛?鍮꾧탳
# ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧
def _calc_angle(kp: dict, a: str, b: str, c: str) -> float:
    """??愿??醫뚰몴濡?B?먯꽌??媛곷룄 怨꾩궛 (ipynb Cell 20 洹몃?濡?"""
    ax, ay = kp[a]["x"], kp[a]["y"]
    bx, by = kp[b]["x"], kp[b]["y"]
    cx, cy = kp[c]["x"], kp[c]["y"]
    ba   = (ax - bx, ay - by)
    bc   = (cx - bx, cy - by)
    dot  = ba[0] * bc[0] + ba[1] * bc[1]
    norm = math.sqrt(ba[0]**2 + ba[1]**2) * math.sqrt(bc[0]**2 + bc[1]**2)
    return math.degrees(math.acos(max(-1, min(1, dot / (norm + 1e-6)))))


def _calc_distance(kp: dict, a: str, b: str) -> float:
    return math.sqrt((kp[a]["x"] - kp[b]["x"])**2 + (kp[a]["y"] - kp[b]["y"])**2)


def _calc_feet_ratio(kp: dict) -> float:
    return _calc_distance(kp, "left_ankle", "right_ankle") / (
        _calc_distance(kp, "left_shoulder", "right_shoulder") + 1e-6
    )


def compare_angles(ref_kp: dict, user_kp: dict, ref_handed: str = "left", user_handed: str = "right") -> dict:
    """
    ?덊띁?곗뒪(?좎닔)? ?ъ슜???ㅽ룷?명듃瑜?鍮꾧탳?⑸땲??
    (ipynb Cell 20 compare_angles 洹몃?濡?

    Returns:
        {
          "lead_elbow_angle": {"ref": 120.5, "user": 105.3, "diff": -15.2, "savant": "Attack Angle"},
          ...
        }
    """
    results = {}
    ref_configs = get_angle_configs(ref_handed)
    user_configs = get_angle_configs(user_handed)

    for name, (a, b, c, savant) in ref_configs.items():
        ua, ub, uc, _ = user_configs[name]
        ref_val  = _calc_angle(ref_kp, a, b, c)
        user_val = _calc_angle(user_kp, ua, ub, uc)
        results[name] = {
            "ref":    round(ref_val,  2),
            "user":   round(user_val, 2),
            "diff":   round(user_val - ref_val, 2),
            "savant": savant,
            "unit":   "deg",
        }

    ref_ratio  = _calc_feet_ratio(ref_kp)
    user_ratio = _calc_feet_ratio(user_kp)
    results["feet_distance_ratio"] = {
        "ref":    round(ref_ratio,  4),
        "user":   round(user_ratio, 4),
        "diff":   round(user_ratio - ref_ratio, 4),
        "savant": "Distance between Feet",
        "unit":   "ratio",
    }

    return results


def _extract_json_object(text: str) -> dict:
    cleaned = text.strip().replace("```json", "").replace("```", "").strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\{[\s\S]*\}", cleaned)
        if not match:
            raise
        return json.loads(match.group(0))


def generate_summary(comparison: dict) -> dict:
    """
    Generate short metric-level diagnosis/solution pairs with Claude.
    This mirrors swing_analysis_final.ipynb Step 5-2.
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY가 설정되지 않았습니다. .env 파일을 확인해주세요.")

    client = Anthropic(api_key=api_key)
    model = os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-4-5")
    c = comparison

    system_prompt = """
You are a baseball swing analyst.
아래 5개 지표 각각에 대해 두 줄 요약을 작성해주세요.

[출력 형식 - 반드시 JSON으로만 출력, 마크다운 코드블록 없이 순수 JSON만 출력]
{
  "lead_elbow_angle":    { "diagnosis": "문제 진단 한 문장", "solution": "해결책 한 문장" },
  "rear_elbow_angle":    { "diagnosis": "문제 진단 한 문장", "solution": "해결책 한 문장" },
  "lead_shoulder_angle": { "diagnosis": "문제 진단 한 문장", "solution": "해결책 한 문장" },
  "hip_angle":           { "diagnosis": "문제 진단 한 문장", "solution": "해결책 한 문장" },
  "feet_distance_ratio": { "diagnosis": "문제 진단 한 문장", "solution": "해결책 한 문장" }
}

[작성 기준]
- diagnosis: 수치를 직접 언급하지 말고, 타자가 체감할 수 있는 표현으로 현재 상태를 설명
- solution: 구체적인 수치 대신 동작이나 감각 중심으로 개선 방향 제시
- 20자 이내로 간결하게
- 예시:
  diagnosis: "공을 너무 위에서 찍어 내리고 있어요."
  solution: "배트를 공 아래에서 밀어올리는 느낌으로 스윙하세요."
- 전체 한국어로 작성
- 수치, 각도, 숫자 절대 사용 금지
"""

    user_prompt = f"""
앞쪽 팔꿈치 각도 (Attack Angle): 레퍼런스 {c['lead_elbow_angle']['ref']:.1f}° / 사용자 {c['lead_elbow_angle']['user']:.1f}° / 차이 {c['lead_elbow_angle']['diff']:+.1f}°
뒤쪽 팔꿈치 각도 (Bat Speed): 레퍼런스 {c['rear_elbow_angle']['ref']:.1f}° / 사용자 {c['rear_elbow_angle']['user']:.1f}° / 차이 {c['rear_elbow_angle']['diff']:+.1f}°
앞쪽 어깨 각도 (Swing Path Tilt): 레퍼런스 {c['lead_shoulder_angle']['ref']:.1f}° / 사용자 {c['lead_shoulder_angle']['user']:.1f}° / 차이 {c['lead_shoulder_angle']['diff']:+.1f}°
엉덩이 각도 (Intercept Point): 레퍼런스 {c['hip_angle']['ref']:.1f}° / 사용자 {c['hip_angle']['user']:.1f}° / 차이 {c['hip_angle']['diff']:+.1f}°
양 발목 거리 비율 (Distance between Feet): 레퍼런스 {c['feet_distance_ratio']['ref']:.2f} / 사용자 {c['feet_distance_ratio']['user']:.2f} / 차이 {c['feet_distance_ratio']['diff']:+.2f}
"""

    response = client.messages.create(
        model=model,
        max_tokens=500,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}],
    )

    text = response.content[0].text.strip()
    if not text:
        raise ValueError("Claude 지표별 요약 응답이 비어있습니다.")

    summary = _extract_json_object(text)
    required = {
        "lead_elbow_angle",
        "rear_elbow_angle",
        "lead_shoulder_angle",
        "hip_angle",
        "feet_distance_ratio",
    }
    missing = required.difference(summary)
    if missing:
        raise ValueError(f"Claude 지표별 요약에 누락된 키가 있습니다: {sorted(missing)}")

    return summary


def generate_pose_video(input_path: str, output_path: str) -> dict:
    """
    Create a video with MediaPipe pose landmarks drawn over the original frames.

    Returns basic metadata that can be useful for display/debugging:
      {"frames": 120, "detected_frames": 110, "fps": 30.0}
    """
    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        raise ValueError("업로드한 영상을 열 수 없습니다.")

    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    if width <= 0 or height <= 0:
        cap.release()
        raise ValueError("영상 크기를 읽을 수 없습니다.")

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    # Prefer browser-playable H.264 MP4. Some OpenCV builds cannot open avc1,
    # so fall back to mp4v rather than failing the whole analysis.
    out = None
    for codec in ("avc1", "H264", "mp4v"):
        fourcc = cv2.VideoWriter_fourcc(*codec)
        candidate = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        if candidate.isOpened():
            out = candidate
            break
        candidate.release()

    if out is None or not out.isOpened():
        cap.release()
        raise ValueError("스켈레톤 영상 파일을 생성할 수 없습니다.")

    frame_idx = 0
    detected_frames = 0

    with mp_pose.Pose(
        static_image_mode=False,
        model_complexity=2,
        smooth_landmarks=True,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
    ) as pose:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = pose.process(rgb)

            if results.pose_landmarks:
                detected_frames += 1
                mp_drawing.draw_landmarks(
                    frame,
                    results.pose_landmarks,
                    mp_pose.POSE_CONNECTIONS,
                    landmark_drawing_spec=mp_styles.get_default_pose_landmarks_style(),
                )

            out.write(frame)
            frame_idx += 1

    cap.release()
    out.release()

    return {
        "frames": frame_idx,
        "detected_frames": detected_frames,
        "fps": fps,
    }


# ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧
# STEP 4 ??Claude API ?쇰뱶諛??앹꽦
# ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧
def generate_feedback(
    comparison: dict,
    ref_handed: str = "left",
    user_handed: str = "right",
    reference_player: str = "레퍼런스 선수",
) -> str:
    """
    Send the swing comparison to Claude and generate Korean coaching feedback.
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY가 설정되지 않았습니다. .env 파일을 확인해주세요.")

    client = Anthropic(api_key=api_key)
    model = os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-4-5")
    c = comparison
    lead_elbow = c.get("lead_elbow_angle") or c.get("left_elbow_angle")
    rear_elbow = c.get("rear_elbow_angle") or c.get("right_elbow_angle")
    lead_shoulder = c.get("lead_shoulder_angle") or c.get("left_shoulder_angle")
    hip = c["hip_angle"]
    feet = c["feet_distance_ratio"]
    handed_desc = {
        "left": "좌타자 (앞팔: 왼팔, 뒷팔: 오른팔)",
        "right": "우타자 (앞팔: 오른팔, 뒷팔: 왼팔)",
    }

    system_prompt = f"""
You are a professional baseball swing coach writing a personalized swing analysis report in Korean.
Your tone is warm, encouraging, and expert — like a coach who genuinely wants the player to improve.

[타격 방향 정보]
- 레퍼런스 선수: {handed_desc.get(ref_handed, handed_desc["right"])}
- 사용자: {handed_desc.get(user_handed, handed_desc["right"])}

[관절 각도와 스윙 지표 매핑]
- 앞쪽 팔꿈치 각도 -> Attack Angle
- 뒤쪽 팔꿈치 각도 -> Bat Speed
- 앞쪽 어깨 각도 -> Swing Path Tilt
- 엉덩이 각도 -> Intercept Point
- 양 발목 거리 비율 -> Distance between Feet

NOTE: Savant 수치 추정 및 언급은 절대 하지 마세요.
오직 관절 각도 차이만을 근거로 피드백을 작성하세요.

[리포트 작성 형식 - 반드시 준수]

도입부 (2문장):
- 첫 문장: "{reference_player}의 스윙 데이터와 비교하여 5개 핵심 지표를 중심으로 종합 평가되었습니다."로 시작
- 둘째 문장: 따뜻한 격려 한 문장

본문 (총 5개 문단, 각 지표당 1문단):
각 문단은 아래 내용을 자연스러운 문장으로 녹여서 작성:
- 해당 지표명과 관절 이름 언급
- 레퍼런스와 사용자의 수치 차이 언급
- 타격 성능에 미치는 영향
- 간단한 개선 방안 1~2가지

마무리 문단:
- 전체 스윙을 종합하는 코멘트
- 가장 우선적으로 개선할 부분 한 가지 강조
- 따뜻한 격려로 마무리

[출력 제약]
- 전체 한국어로 작성
- 번호 목록, 불릿 포인트, 마크다운 헤더(##) 절대 사용 금지
- 문단 구분은 빈 줄 하나로만
- 각 문단은 3~5문장 분량
- 전체 글자 수 1500~2200자
"""

    user_prompt = f"""
[비교 데이터]
레퍼런스 선수: {reference_player}
레퍼런스 타격 방향: {handed_desc.get(ref_handed, handed_desc["right"])}
사용자 타격 방향: {handed_desc.get(user_handed, handed_desc["right"])}

1. lead_elbow_angle (Attack Angle): 기준 선수 {lead_elbow['ref']:.1f}도 / 사용자 {lead_elbow['user']:.1f}도 / 차이 {lead_elbow['diff']:+.1f}도
2. rear_elbow_angle (Bat Speed): 기준 선수 {rear_elbow['ref']:.1f}도 / 사용자 {rear_elbow['user']:.1f}도 / 차이 {rear_elbow['diff']:+.1f}도
3. lead_shoulder_angle (Swing Path Tilt): 기준 선수 {lead_shoulder['ref']:.1f}도 / 사용자 {lead_shoulder['user']:.1f}도 / 차이 {lead_shoulder['diff']:+.1f}도
4. hip_angle (Intercept Point): 기준 선수 {hip['ref']:.1f}도 / 사용자 {hip['user']:.1f}도 / 차이 {hip['diff']:+.1f}도
5. feet_distance_ratio: 기준 선수 {feet['ref']:.2f} / 사용자 {feet['user']:.2f} / 차이 {feet['diff']:+.2f}

위 데이터를 바탕으로 지정된 형식에 맞춰 스윙 분석 리포트를 작성해주세요.
"""

    response = client.messages.create(
        model=model,
        max_tokens=2200,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}],
    )

    return response.content[0].text.strip()


# ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧
# ?꾩껜 ?뚯씠?꾨씪???ㅽ뻾 ?⑥닔
# ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧
def run_analysis(
    video_path: str,
    ref_json_path: str,
    impact_frame: int = -1,   # -1 ?대㈃ ?먮룞 媛먯?
    user_handed: str = "right",
    progress_callback=None,
) -> dict:
    """
    ?곸긽 寃쎈줈 + ?덊띁?곗뒪 JSON + ?꾪뙥???꾨젅????遺꾩꽍 寃곌낵 dict 諛섑솚

    Returns:
        {
          "impact_frame":  34,
          "comparison":    { ... },
          "feedback":      "...",
          "metric_feedback": { ... },
        }
    """
    # ?덊띁?곗뒪 ?ㅽ룷?명듃 濡쒕뱶
    with open(ref_json_path, "r", encoding="utf-8") as f:
        ref_data = json.load(f)
    ref_kp = ref_data["keypoints"]
    ref_handed = ref_data.get("handed")
    if ref_handed not in {"left", "right"}:
        raise ValueError("레퍼런스 JSON에 handed 필드(left/right)가 필요합니다.")

    # ?꾪뙥???꾨젅??寃곗젙
    if impact_frame == -1:
        impact_frame = detect_impact_frame(video_path)
        if impact_frame == -1:
            raise ValueError("임팩트 프레임을 자동 감지하지 못했습니다. 프레임 번호를 직접 입력해주세요.")

    # ?ъ슜???ㅽ룷?명듃 異붿텧
    if progress_callback:
        progress_callback("pose", "포즈 감지 중")
    user_kp = extract_keypoints(video_path, impact_frame)

    # 媛곷룄 鍮꾧탳
    if progress_callback:
        progress_callback("angles", "각도 계산 중")
    comparison = compare_angles(ref_kp, user_kp, ref_handed, user_handed)

    # Claude feedback is optional. The numeric analysis should still be returned
    # when the API key is missing or the external call fails.
    if progress_callback:
        progress_callback("reference", "레퍼런스 비교 중")
    try:
        feedback = generate_feedback(
            comparison,
            ref_handed,
            user_handed,
            ref_data.get("player", "레퍼런스 선수"),
        )
    except Exception as exc:
        feedback = f"Feedback generation skipped: {exc}"

    try:
        metric_feedback = generate_summary(comparison)
        metric_feedback_error = ""
    except Exception as exc:
        metric_feedback = {}
        metric_feedback_error = str(exc)

    return {
        "impact_frame":  impact_frame,
        "comparison":    comparison,
        "metric_feedback": metric_feedback,
        "metric_feedback_error": metric_feedback_error,
        "feedback":      feedback,
        "user_keypoints": user_kp,
        "reference_player": ref_data.get("player", "레퍼런스 선수"),
        "reference_handed": ref_handed,
        "user_handed": user_handed,
    }


import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './UploadPage.css'
import { setUploadedSwing } from '../swingSession'

const FPS = 30
const HANDED_OPTIONS = [
  { value: 'left', label: '좌타자' },
  { value: 'right', label: '우타자' },
]

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0.000'
  return seconds.toFixed(3)
}

export default function UploadPage() {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const fileInputRef = useRef(null)

  const [file, setFile] = useState(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [totalFrames, setTotalFrames] = useState(0)
  const [impactFrame, setImpactFrame] = useState('')
  const [impactTime, setImpactTime] = useState('')
  const [userHanded, setUserHanded] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const isReady = file !== null && impactFrame !== '' && userHanded !== ''

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl)
    }
  }, [videoUrl])

  function openFilePicker() {
    fileInputRef.current?.click()
  }

  function handleFile(f) {
    if (!f) return
    const ext = f.name.split('.').pop().toLowerCase()
    if (!['mp4', 'mov'].includes(ext)) {
      alert('MP4 또는 MOV 파일만 업로드 가능합니다.')
      return
    }

    if (videoUrl) URL.revokeObjectURL(videoUrl)
    const nextUrl = URL.createObjectURL(f)

    setFile(f)
    setVideoUrl(nextUrl)
    setCurrentTime(0)
    setDuration(0)
    setCurrentFrame(0)
    setTotalFrames(0)
    setImpactFrame('')
    setImpactTime('')
    setUserHanded('')
    setIsPlaying(false)
  }

  function handleVideoLoaded() {
    const video = videoRef.current
    if (!video) return
    const nextDuration = Number.isFinite(video.duration) ? video.duration : 0
    setDuration(nextDuration)
    setTotalFrames(Math.max(0, Math.round(nextDuration * FPS)))
    setCurrentTime(0)
    setCurrentFrame(0)
  }

  function syncVideoTime(time) {
    const video = videoRef.current
    if (!video) return
    video.currentTime = time
    setCurrentTime(time)
    setCurrentFrame(Math.round(time * FPS))
  }

  function handleTimeUpdate() {
    const video = videoRef.current
    if (!video) return
    const nextTime = video.currentTime
    setCurrentTime(nextTime)
    setCurrentFrame(Math.round(nextTime * FPS))
  }

  function handleSliderChange(e) {
    syncVideoTime(Number(e.target.value))
  }

  function togglePlay() {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play()
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  function handleSelectImpactFrame() {
    const video = videoRef.current
    if (!video) return
    video.pause()
    setIsPlaying(false)
    setImpactFrame(String(currentFrame))
    setImpactTime(formatTime(currentTime))
  }

  function handleNext() {
    if (!isReady) return
    setUploadedSwing(file)
    sessionStorage.setItem('uploadedFileName', file.name)
    sessionStorage.setItem('impactFrame', impactFrame)
    sessionStorage.setItem('impactTimestamp', impactTime)
    sessionStorage.setItem('userHanded', userHanded)
    navigate('/select')
  }

  return (
    <div className="upload-page">
      <button className="upload-back-btn" onClick={() => navigate('/home')}>&#8592; 뒤로</button>

      <div className={`upload-container${videoUrl ? ' has-preview' : ''}`}>
        {!videoUrl ? (
          <div className="upload-box-wrapper">
            <div
              className={`upload-box${dragOver ? ' drag-over' : ''}`}
              onClick={openFilePicker}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
            >
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="21" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" />
                <path d="M16 5 C23 11, 23 37, 16 43" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeDasharray="3 2.5" />
                <path d="M32 5 C25 11, 25 37, 32 43" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeDasharray="3 2.5" />
              </svg>
              <div className="upload-text">스윙 영상을<br />드래그하거나 클릭해서<br />업로드</div>
              <div className="upload-sub">MP4, MOV 파일 지원</div>
            </div>
          </div>
        ) : (
          <div className="frame-picker">
            <div className="frame-video-shell">
              <video
                ref={videoRef}
                src={videoUrl}
                className="frame-video"
                playsInline
                preload="metadata"
                onLoadedMetadata={handleVideoLoaded}
                onTimeUpdate={handleTimeUpdate}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              />
            </div>

            <div className="frame-controls">
              <button className="frame-play-btn" type="button" onClick={togglePlay} aria-label={isPlaying ? '일시정지' : '재생'}>
                {isPlaying ? 'Ⅱ' : '▶'}
              </button>
              <div className="frame-slider-group">
                <input
                  className="frame-slider"
                  type="range"
                  min="0"
                  max={duration || 0}
                  step={1 / FPS}
                  value={currentTime}
                  onChange={handleSliderChange}
                />
                <div className="frame-slider-meta">
                  <span>0.000s</span>
                  <span>{totalFrames} frames</span>
                  <span>{formatTime(duration)}s</span>
                </div>
              </div>
            </div>

            <div className="frame-info">
              <div>
                <span>현재 시간</span>
                <strong>{formatTime(currentTime)}s</strong>
              </div>
              <div>
                <span>현재 프레임</span>
                <strong>{currentFrame}</strong>
              </div>
              <div>
                <span>FPS</span>
                <strong>{FPS}</strong>
              </div>
            </div>

            <div className="impact-actions">
              <button className="impact-select-btn" type="button" onClick={handleSelectImpactFrame}>
                이 프레임 선택
              </button>
              {impactFrame !== '' && (
                <div className="impact-selected">
                  <span>선택됨</span>
                  <strong>Frame {impactFrame}</strong>
                  <em>{impactTime}s</em>
                </div>
              )}
            </div>

            <div className="handed-card">
              <div className="handed-copy">
                <span>타격 방향</span>
                <strong>본인의 타석 방향을 선택하세요.</strong>
              </div>
              <div className="handed-options" role="group" aria-label="타격 방향">
                {HANDED_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    className={`handed-option${userHanded === option.value ? ' selected' : ''}`}
                    onClick={() => setUserHanded(option.value)}
                  >
                    <span className="handed-ball">⚾</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="upload-file-row">
              <span className="upload-filename">{file.name}</span>
              <button className="upload-change-btn" type="button" onClick={openFilePicker}>영상 변경</button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          id="fileInput"
          type="file"
          accept=".mp4,.mov,video/mp4,video/quicktime"
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files[0])}
        />

        <button className="next-btn" disabled={!isReady} onClick={handleNext}>
          다음 &rarr;
        </button>
      </div>
    </div>
  )
}

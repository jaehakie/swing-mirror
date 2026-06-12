import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './AnalyzingPage.css'
import { API_BASE, pollResult } from '../api'
import { getUploadedSwing } from '../swingSession'

const STAGE_INDEX = {
  pose: 0,
  angles: 1,
  reference: 2,
  done: 3,
}

const STAGE_MESSAGES = {
  pose: '포즈 감지 중...',
  angles: '각도 계산 중...',
  reference: '레퍼런스 비교 중...',
  done: '분석이 완료되었습니다.',
}

const MIN_STAGE_MS = 1400

function resolveMediaUrl(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`
}

function stageFromIndex(index) {
  return Object.keys(STAGE_INDEX).find(stage => STAGE_INDEX[stage] === index) || 'pose'
}

export default function AnalyzingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const jobId = location.state?.jobId
  const sourceVideoRef = useRef(null)
  const skeletonVideoRef = useRef(null)

  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [sourceVideoUrl, setSourceVideoUrl] = useState('')
  const [skeletonVideoUrl, setSkeletonVideoUrl] = useState('')
  const [targetStageIndex, setTargetStageIndex] = useState(STAGE_INDEX.pose)
  const [displayStageIndex, setDisplayStageIndex] = useState(STAGE_INDEX.pose)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const file = getUploadedSwing()
    if (!file) return undefined

    const url = URL.createObjectURL(file)
    setSourceVideoUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [])

  useEffect(() => {
    if (!jobId) {
      setError('분석 작업 ID가 없습니다. 영상을 다시 업로드해주세요.')
      setTargetStageIndex(STAGE_INDEX.done)
      return undefined
    }

    return pollResult(
      jobId,
      result => {
        setSkeletonVideoUrl(resolveMediaUrl(result.skeleton_video_url))
        setAnalysisResult(result)
        setTargetStageIndex(STAGE_INDEX.done)
      },
      message => {
        setError(message)
        setTargetStageIndex(STAGE_INDEX.done)
      },
      progress => {
        if (progress.skeleton_video_url) {
          setSkeletonVideoUrl(resolveMediaUrl(progress.skeleton_video_url))
        }

        const nextStage = progress.progress_stage || 'pose'
        const nextIndex = STAGE_INDEX[nextStage] ?? STAGE_INDEX.pose
        setTargetStageIndex(prev => Math.max(prev, nextIndex))
      }
    )
  }, [jobId])

  useEffect(() => {
    if (displayStageIndex >= targetStageIndex) return undefined

    const timer = setTimeout(() => {
      setDisplayStageIndex(prev => Math.min(prev + 1, targetStageIndex))
    }, MIN_STAGE_MS)

    return () => clearTimeout(timer)
  }, [displayStageIndex, targetStageIndex])

  useEffect(() => {
    const canAutoplay = Boolean(analysisResult) && displayStageIndex >= STAGE_INDEX.done
    const sourceVideo = sourceVideoRef.current
    if (!canAutoplay || !sourceVideo) return

    sourceVideo.currentTime = 0
    if (skeletonVideoRef.current) {
      skeletonVideoRef.current.currentTime = 0
    }

    sourceVideo.play()
      .then(() => {
        skeletonVideoRef.current?.play?.().catch(() => {})
        setPlaying(true)
      })
      .catch(() => setPlaying(false))
  }, [analysisResult, displayStageIndex])

  function togglePlay() {
    const video = sourceVideoRef.current
    if (!video) return

    if (!video.paused) {
      video.pause()
      skeletonVideoRef.current?.pause()
      setPlaying(false)
    } else {
      video.play()
        .then(() => {
          skeletonVideoRef.current?.play?.().catch(() => {})
          setPlaying(true)
        })
        .catch(() => setPlaying(false))
    }
  }

  function seekVideo(e) {
    const video = sourceVideoRef.current
    if (!video || !duration) return

    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    const nextTime = Math.max(0, Math.min(duration, ratio * duration))

    video.currentTime = nextTime
    if (skeletonVideoRef.current) {
      skeletonVideoRef.current.currentTime = nextTime
    }
    setCurrentTime(nextTime)
  }

  function handleVideoLoaded() {
    const video = sourceVideoRef.current
    if (!video) return
    setDuration(Number.isFinite(video.duration) ? video.duration : 0)
    setCurrentTime(video.currentTime || 0)
  }

  function handleVideoTimeUpdate() {
    const video = sourceVideoRef.current
    if (!video) return
    setCurrentTime(video.currentTime || 0)
  }

  function pad(n) {
    return String(Math.floor(n)).padStart(2, '0')
  }

  function fmtTime(s) {
    return `${pad(s / 60)}:${pad(s % 60)}`
  }

  function stepState(index) {
    if (displayStageIndex > index) return 'done'
    if (displayStageIndex === index) return 'active'
    return 'waiting'
  }

  const progressPct = duration ? (currentTime / duration) * 100 : 0
  const displayedStage = stageFromIndex(displayStageIndex)
  const done = Boolean(error) || (Boolean(analysisResult) && displayStageIndex >= STAGE_INDEX.done)

  return (
    <div className="analyzing-page">
      <div className="an-bg" />
      <div className="an-screen">
        <button className="an-back-btn" onClick={() => navigate('/select')}>
          <span>←</span> 뒤로
        </button>

        <h1 className="an-title">스윙 분석 중 ...</h1>

        <div className="an-video-panel">
          <div className="an-video-half left">
            <span className="vid-label label-left">원본</span>
            {sourceVideoUrl ? (
              <video
                ref={sourceVideoRef}
                className="an-source-video"
                src={sourceVideoUrl}
                playsInline
                muted
                preload="metadata"
                onLoadedMetadata={handleVideoLoaded}
                onTimeUpdate={handleVideoTimeUpdate}
                onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)}
              />
            ) : (
              <div className="vid-placeholder">
                <span>업로드한 영상을 찾을 수 없습니다.</span>
              </div>
            )}
          </div>

          <div className="an-video-half right">
            <span className="vid-label label-right">스켈레톤</span>
            {skeletonVideoUrl ? (
              <video
                ref={skeletonVideoRef}
                className="an-source-video"
                src={skeletonVideoUrl}
                playsInline
                muted
                preload="metadata"
              />
            ) : (
              <div className="vid-placeholder">
                <span>스켈레톤 영상을 생성하는 중입니다.</span>
              </div>
            )}
          </div>

          <div className="an-divider-line" />
          <button className="an-split-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 16l-4-4 4-4M17 8l4 4-4 4M3 12h18"/>
            </svg>
          </button>

          <div className="an-ctrl-bar">
            <button className="an-play-btn" onClick={togglePlay}>
              {playing
                ? <svg viewBox="0 0 24 24" fill="#fff"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                : <svg viewBox="0 0 24 24" fill="#fff"><polygon points="5,3 19,12 5,21"/></svg>
              }
            </button>
            <span className="an-timecode">{fmtTime(currentTime)} / {fmtTime(duration)}</span>
            <div className="an-progress-wrap" onClick={seekVideo}>
              <div className="an-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <button className="an-fullscreen-btn" onClick={() => document.documentElement.requestFullscreen?.()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                <path d="M8 3H5a2 2 0 00-2 2v3M21 8V5a2 2 0 00-2-2h-3M16 21h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="an-steps">
          <StepItem state={stepState(0)} label1="포즈 감지 대기" label2="포즈 감지 중..." label3="포즈 감지" />
          <div className="step-line" />
          <StepItem state={stepState(1)} label1="각도 계산 대기" label2="각도 계산 중..." label3="각도 계산" num="2" />
          <div className="step-line" />
          <StepItem state={stepState(2)} label1="레퍼런스 비교 대기" label2="레퍼런스 비교 중..." label3="레퍼런스 비교" num="3" />
        </div>

        <button
          className={`an-result-btn${done ? ' active' : ''}`}
          onClick={() => {
            if (!done) return
            if (error) navigate('/upload')
            else if (analysisResult) navigate('/result', { state: analysisResult })
          }}
        >
          {error ? '다시 업로드' : done ? '결과 보기' : '분석 결과 대기 중'}
        </button>

        <p className="an-guide">
          {error || (done
            ? '분석이 완료되었습니다. 결과 보기 버튼을 눌러 확인하세요.'
            : STAGE_MESSAGES[displayedStage])}
        </p>
      </div>
    </div>
  )
}

function StepItem({ state, label1, label2, label3, num = '1' }) {
  const label = state === 'done' ? (label3 || label1) : state === 'active' ? label2 : label1
  return (
    <div className={`an-step ${state}`}>
      <div className="step-num">{num}</div>
      <span className="step-label">{label}</span>
      {state === 'active' && <div className="step-spinner" />}
      {state === 'done' && <span className="check-icon">✓</span>}
    </div>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { API_BASE } from '../api'
import { getUploadedSwing } from '../swingSession'
import './ResultPage.css'

const REF_COLOR = '#00bcd4'
const USER_COLOR = '#e8b84b'

const METRIC_META = {
  lead_elbow_angle: {
    name: 'Attack Angle',
    bodyPart: '앞쪽 팔꿈치',
    maxVal: 150,
  },
  rear_elbow_angle: {
    name: 'Bat Speed',
    bodyPart: '뒤쪽 팔꿈치',
    maxVal: 200,
  },
  lead_shoulder_angle: {
    name: 'Swing Path Tilt',
    bodyPart: '앞쪽 어깨',
    maxVal: 80,
  },
  hip_angle: {
    name: 'Intercept Point',
    bodyPart: '엉덩이',
    maxVal: 200,
  },
  feet_distance_ratio: {
    name: 'Distance between Feet',
    bodyPart: '양 발목 거리 비율',
    maxVal: 6,
  },
}

const METRIC_ORDER = [
  'lead_elbow_angle',
  'rear_elbow_angle',
  'lead_shoulder_angle',
  'hip_angle',
  'feet_distance_ratio',
]

const DIFF_STYLE = {
  good: { color: '#4caf50', bg: 'rgba(76,175,80,0.2)', border: 'rgba(76,175,80,0.45)' },
  warn: { color: '#ff9800', bg: 'rgba(255,152,0,0.2)', border: 'rgba(255,152,0,0.45)' },
  bad: { color: '#f44336', bg: 'rgba(244,67,54,0.2)', border: 'rgba(244,67,54,0.45)' },
}

function resolveMediaUrl(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`
}

function classifyDiff(diff, unit) {
  const abs = Math.abs(Number(diff) || 0)
  if (unit === 'ratio') {
    if (abs < 0.12) return 'good'
    if (abs < 0.45) return 'warn'
    return 'bad'
  }
  if (abs < 5) return 'good'
  if (abs < 15) return 'warn'
  return 'bad'
}

function formatMetricValue(value, unit) {
  const n = Number(value) || 0
  if (unit === 'ratio') return n.toFixed(2)
  return `${n.toFixed(1)}°`
}

function formatDiff(value, unit) {
  const n = Number(value) || 0
  const sign = n > 0 ? '+' : ''
  if (unit === 'ratio') return `${sign}${n.toFixed(2)}`
  return `${sign}${n.toFixed(1)}°`
}

function orderedEntries(comparison) {
  const entries = Object.entries(comparison || {})
  return entries.sort(([a], [b]) => {
    const ai = METRIC_ORDER.indexOf(a)
    const bi = METRIC_ORDER.indexOf(b)
    if (ai === -1 && bi === -1) return a.localeCompare(b)
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })
}

function buildMetrics(apiResult) {
  const comparison = apiResult?.comparison || {}
  const summaries = apiResult?.metric_feedback || {}

  return orderedEntries(comparison).map(([id, item]) => {
    const meta = METRIC_META[id] || {
      name: item.savant || id,
      bodyPart: item.savant || id,
      maxVal: item.unit === 'ratio' ? 6 : 200,
    }
    const summary = summaries[id] || {}
    const unit = item.unit || 'deg'

    return {
      id,
      name: summary.name || meta.name,
      bodyPart: summary.body_part || meta.bodyPart,
      refVal: Number(item.ref || 0),
      userVal: Number(item.user || 0),
      diff: Number(item.diff || 0),
      diffText: formatDiff(item.diff, unit),
      unit,
      maxVal: meta.maxVal,
      diffType: classifyDiff(item.diff, unit),
      diagnosis: summary.diagnosis || null,
      solution: summary.solution || null,
    }
  })
}

function buildReportText(apiResult) {
  const feedback = apiResult?.feedback || ''
  if (!feedback) return '분석 리포트가 아직 생성되지 않았습니다.'
  if (feedback.startsWith('Feedback generation skipped:')) {
    return 'AI 리포트 생성은 건너뛰어졌지만, 위 지표 비교는 실제 영상 분석 결과입니다. ANTHROPIC_API_KEY가 설정되면 상세 리포트가 생성됩니다.'
  }
  return feedback
}

function handedLabel(value) {
  if (value === 'left') return '좌타자'
  if (value === 'right') return '우타자'
  return '-'
}

function MetricIcon({ id }) {
  if (id === 'lead_elbow_angle') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21 L21 21 L3 4 Z" />
      <path d="M3 21 L21 21" />
    </svg>
  )
  if (id === 'rear_elbow_angle') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 12 L17 7" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
  if (id === 'lead_shoulder_angle') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 18 Q10 4 20 8" />
      <path d="M17 5 L20 8 L16 10" />
    </svg>
  )
  if (id === 'hip_angle') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="2.5" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
    </svg>
  )
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 19 L6 13 L9 11 L11 15 L13 15 L15 11 L18 13 L16 19 Z" />
    </svg>
  )
}

function VideoBox({ label, src, fallbackSrc, isRef }) {
  const accent = isRef ? REF_COLOR : USER_COLOR
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [videoFailed, setVideoFailed] = useState(false)
  const showFallback = Boolean(videoFailed && fallbackSrc)

  function togglePlay() {
    if (showFallback) return

    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    } else {
      video.pause()
      setPlaying(false)
    }
  }

  function pad(n) {
    return String(Math.floor(n)).padStart(2, '0')
  }

  function fmtTime(s) {
    return `${pad(s / 60)}:${pad(s % 60)}`
  }

  const progress = duration ? (currentTime / duration) * 100 : 0

  return (
    <div className="rp-video-wrap">
      <div className="rp-video-label" style={{ color: accent }}>
        <span className="rp-video-dot" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />
        {label}
      </div>
      <div className="rp-video-box">
        {showFallback ? (
          <img
            className="rp-video-inner"
            src={fallbackSrc}
            alt={label}
          />
        ) : src ? (
          <video
            ref={videoRef}
            className="rp-video-inner"
            src={src}
            playsInline
            muted
            preload="metadata"
            onError={() => setVideoFailed(true)}
            onLoadedMetadata={() => setDuration(Number.isFinite(videoRef.current?.duration) ? videoRef.current.duration : 0)}
            onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
          />
        ) : (
          <div className="rp-video-inner rp-video-placeholder">
            <span>{isRef ? '레퍼런스 영상 영역' : '사용자 영상 없음'}</span>
          </div>
        )}
        <div className="rp-video-controls">
          <button className="rp-vc-play" onClick={togglePlay} disabled={!src || showFallback}>{showFallback ? 'LIVE' : playing ? 'Ⅱ' : '▶'}</button>
          <span className="rp-vc-time">{fmtTime(currentTime)} / {fmtTime(duration)}</span>
          <div className="rp-vc-track">
            <div className="rp-vc-progress" style={{ width: `${progress}%`, background: accent }} />
          </div>
          <button className="rp-vc-ico" onClick={() => videoRef.current?.requestFullscreen?.()} disabled={!src || showFallback}>⛶</button>
        </div>
      </div>
    </div>
  )
}

export default function ResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const apiResult = location.state || {}
  const metrics = useMemo(() => buildMetrics(apiResult), [apiResult])
  const reportText = useMemo(() => buildReportText(apiResult), [apiResult])
  const [sourceVideoUrl, setSourceVideoUrl] = useState('')
  const [referenceVideoInfo, setReferenceVideoInfo] = useState({
    videoUrl: apiResult.reference_video_url || '',
    streamUrl: apiResult.reference_video_stream_url || '',
  })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const file = getUploadedSwing()
    if (!file) return undefined

    const url = URL.createObjectURL(file)
    setSourceVideoUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [])

  useEffect(() => {
    if (apiResult.reference_video_url || apiResult.reference_video_stream_url) {
      setReferenceVideoInfo({
        videoUrl: apiResult.reference_video_url || '',
        streamUrl: apiResult.reference_video_stream_url || '',
      })
      return
    }

    const referencePlayerId = sessionStorage.getItem('referencePlayer')
    if (!referencePlayerId) return

    fetch(`${API_BASE}/api/players`)
      .then(res => (res.ok ? res.json() : []))
      .then(players => {
        const player = players.find(item => item.id === referencePlayerId)
        if (!player) return
        setReferenceVideoInfo({
          videoUrl: player.reference_video_url || '',
          streamUrl: player.reference_video_stream_url || '',
        })
      })
      .catch(() => {})
  }, [apiResult.reference_video_stream_url, apiResult.reference_video_url])

  function copyReport() {
    navigator.clipboard?.writeText(reportText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const hasAnalysis = metrics.length > 0
  const referenceVideoUrl = resolveMediaUrl(referenceVideoInfo.videoUrl)
  const referenceVideoStreamUrl = resolveMediaUrl(referenceVideoInfo.streamUrl)
  const userVideoUrl = resolveMediaUrl(apiResult.skeleton_video_url) || sourceVideoUrl
  const referenceName = apiResult.reference_player || sessionStorage.getItem('referencePlayer') || '레퍼런스 선수'
  const reportDate = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })

  return (
    <div className="rp-page">
      <div className="rp-bg" />
      <div className="rp-screen">
        <div className="rp-toolbar">
          <button className="rp-back-btn" onClick={() => navigate('/upload')}>← 뒤로</button>
          <div className="rp-logo">
            <img src="/images/로고.png" alt="Swing Mirror" />
          </div>
          <div className="rp-toolbar-right">
            <button className="rp-exercise-btn" onClick={() => navigate('/exercise', { state: apiResult })}>
              맞춤 운동 추천
            </button>
            <button className="rp-save-btn" onClick={copyReport}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                <path d="M8 2 L8 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M4.5 7 L8 11 L11.5 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 14 L14 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              {copied ? '복사됨' : '리포트 저장'}
            </button>
          </div>
        </div>

        <div className="rp-video-row">
          <VideoBox label="레퍼런스 영상" src={referenceVideoUrl} fallbackSrc={referenceVideoStreamUrl} isRef />
          <div className="rp-vs">
            <div className="rp-vs-circle">VS</div>
          </div>
          <VideoBox label="사용자 분석 영상" src={userVideoUrl} />
        </div>

        <div className="rp-metrics-section">
          <div className="rp-metrics-header">
            <span className="rp-metrics-title">지표 비교</span>
            <div className="rp-metrics-legend">
              <span><span className="rp-legend-dot" style={{ background: REF_COLOR }} /> 레퍼런스</span>
              <span><span className="rp-legend-dot" style={{ background: USER_COLOR }} /> 사용자</span>
            </div>
          </div>
          <div className="rp-metrics-card">
            {hasAnalysis ? (
              <div className="rp-metrics-cols">
                {metrics.map(m => {
                  const refPct = Math.min(100, (m.refVal / m.maxVal) * 100)
                  const userPct = Math.min(100, (m.userVal / m.maxVal) * 100)
                  const style = DIFF_STYLE[m.diffType]
                  return (
                    <div className="rp-metric-col" key={m.id}>
                      <div className="rp-mc-header">
                        <span className="rp-mc-icon"><MetricIcon id={m.id} /></span>
                        <div>
                          <div className="rp-mc-label">{m.bodyPart}</div>
                          <div className="rp-mc-name">{m.name}</div>
                          <div className="rp-mc-unit">{m.unit === 'ratio' ? '(ratio)' : '(°)'}</div>
                        </div>
                      </div>
                      <div className="rp-bar-row">
                        <div className="rp-bar-track">
                          <div className="rp-bar-fill" style={{ width: `${refPct}%`, background: REF_COLOR }} />
                        </div>
                        <span className="rp-bar-val" style={{ color: REF_COLOR }}>{formatMetricValue(m.refVal, m.unit)}</span>
                      </div>
                      <div className="rp-bar-row">
                        <div className="rp-bar-track">
                          <div className="rp-bar-fill" style={{ width: `${userPct}%`, background: USER_COLOR }} />
                        </div>
                        <span className="rp-bar-val" style={{ color: USER_COLOR }}>{formatMetricValue(m.userVal, m.unit)}</span>
                      </div>
                      <div className="rp-diff-badge" style={{ color: style.color, background: style.bg, border: `1px solid ${style.border}` }}>
                        {m.diffText}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="rp-empty-state">분석 결과가 없습니다. 업로드부터 다시 진행해주세요.</div>
            )}
          </div>
        </div>

        {hasAnalysis && (
          <div className="rp-feedback-section">
            <div className="rp-feedback-title">지표별 분석</div>
            {apiResult.metric_feedback_error && (
              <div className="rp-feedback-warning">지표별 AI 요약 생성 실패: {apiResult.metric_feedback_error}</div>
            )}
            <div className="rp-feedback-cards">
              {metrics.map(m => {
                const style = DIFF_STYLE[m.diffType]
                return (
                  <div className="rp-fb-card" key={m.id}>
                    <div className="rp-fb-top">
                      <span className="rp-fb-icon"><MetricIcon id={m.id} /></span>
                      <span className="rp-fb-name">
                        <span className="rp-fb-bodypart">{m.bodyPart}</span>
                        <span className="rp-fb-arrow"> → </span>
                        {m.name}
                      </span>
                      <span className="rp-fb-diff" style={{ color: style.color, background: style.bg }}>{m.diffText}</span>
                    </div>
                    <div className="rp-fb-body">
                      <div className="rp-fb-bar" style={{ background: style.color }} />
                      <div className="rp-fb-text">
                        {m.diagnosis && m.solution ? (
                          <>
                            <p>{m.diagnosis}</p>
                            <p>{m.solution}</p>
                          </>
                        ) : (
                          <p>AI 요약을 생성하지 못했습니다.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="rp-report-section">
          <div className="rp-report-title">AI 스윙 분석 리포트</div>
          <div className="rp-report-paper">
            <img src="/images/로고.png" alt="" className="rp-report-watermark" aria-hidden="true" />

            <div className="rp-report-logo-header">
              <img src="/images/logos/다저스.png" alt="reference team" className="rp-report-logo" />
              <div className="rp-report-logo-divider" />
              <div className="rp-report-meta">
                <span>레퍼런스 선수 : {referenceName}</span>
                <span className="rp-report-meta-sep">|</span>
                <span>레퍼런스 : {handedLabel(apiResult.reference_handed)}</span>
                <span className="rp-report-meta-sep">|</span>
                <span>사용자 : {handedLabel(apiResult.user_handed)}</span>
                <span className="rp-report-meta-sep">|</span>
                <span>분석일 : {reportDate}</span>
              </div>
            </div>

            <div className="rp-report-rule" />

            <div className="rp-report-body">
              {reportText.split(/\n{2,}/).map((para, i) => (
                <p key={i} className="rp-report-para">{para}</p>
              ))}
            </div>

            <div className="rp-report-footer">
              <div className="rp-report-rule" style={{ marginBottom: '16px' }} />
              <div className="rp-report-footer-inner">
                <div className="rp-report-sig">Swing Mirror AI Analyst</div>
                <img src="/images/logos/다저스.png" alt="reference team" className="rp-report-logo-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

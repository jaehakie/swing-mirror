import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import './ArchivePage.css'

const ARCHIVE_DATA = [
  { date: '2026.03.18', time: '오후 8:14', player: '오타니 쇼헤이', team: 'Los Angeles Dodgers', batSpeed: 74.2, attackAngle: 11, swingTilt: 28 },
  { date: '2026.03.16', time: '오후 7:42', player: '오타니 쇼헤이', team: 'Los Angeles Dodgers', batSpeed: 72.8, attackAngle: 9,  swingTilt: 23 },
  { date: '2026.03.14', time: '오후 6:21', player: '오타니 쇼헤이', team: 'Los Angeles Dodgers', batSpeed: 71.1, attackAngle: 7,  swingTilt: 19 },
  { date: '2026.03.12', time: '오후 9:03', player: '오타니 쇼헤이', team: 'Los Angeles Dodgers', batSpeed: 75.3, attackAngle: 12, swingTilt: 31 },
]

const DATE_OPTIONS   = ['최근 7일', '최근 30일', '최근 3개월', '전체']
const PLAYER_OPTIONS = ['전체 선수', '오타니 쇼헤이', '이승엽', '박병호', '이정후', '이종범']

export default function ArchivePage() {
  const navigate = useNavigate()
  const [selected, setSelected]       = useState(0)
  const [dateOpen, setDateOpen]       = useState(false)
  const [playerOpen, setPlayerOpen]   = useState(false)
  const [dateFilter, setDateFilter]   = useState('최근 30일')
  const [playerFilter, setPlayerFilter] = useState('오타니 쇼헤이')

  return (
    <div className="archive-page" onClick={() => { setDateOpen(false); setPlayerOpen(false) }}>
      <div className="archive-bg" />
      <Nav />

      <div className="archive-wrap">
        <button className="archive-back-btn" onClick={() => navigate('/home')}>← 홈으로 돌아가기</button>

        <div className="archive-header">
          <div>
            <h1 className="archive-title">스윙 아카이브</h1>
            <p className="archive-subtitle">나의 스윙 기록을 확인하세요</p>
          </div>

          <div className="filters">
            {/* 날짜 필터 */}
            <div
              className={`filter-dropdown${dateOpen ? ' open' : ''}`}
              onClick={e => e.stopPropagation()}
            >
              <button className="filter-btn" onClick={() => { setDateOpen(v => !v); setPlayerOpen(false) }}>
                <span className="filter-btn-left">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="1" y="2.5" width="12" height="10.5" rx="1.5" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2"/>
                    <path d="M4 1v3M10 1v3" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" strokeLinecap="round"/>
                    <path d="M1 6h12" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2"/>
                  </svg>
                  <span>{dateFilter}</span>
                </span>
                <span className="filter-chevron">▾</span>
              </button>
              <div className="filter-options">
                {DATE_OPTIONS.map(opt => (
                  <div
                    key={opt}
                    className={`filter-option${opt === dateFilter ? ' sel' : ''}`}
                    onClick={() => { setDateFilter(opt); setDateOpen(false) }}
                  >{opt}</div>
                ))}
              </div>
            </div>

            {/* 선수 필터 */}
            <div
              className={`filter-dropdown${playerOpen ? ' open' : ''}`}
              onClick={e => e.stopPropagation()}
            >
              <button className="filter-btn" onClick={() => { setPlayerOpen(v => !v); setDateOpen(false) }}>
                <span className="filter-btn-left">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="4.5" r="2.8" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2"/>
                    <path d="M1.5 13c0-3 2.5-4.5 5.5-4.5s5.5 1.5 5.5 4.5" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  <span>{playerFilter}</span>
                </span>
                <span className="filter-chevron">▾</span>
              </button>
              <div className="filter-options">
                {PLAYER_OPTIONS.map(opt => (
                  <div
                    key={opt}
                    className={`filter-option${opt === playerFilter ? ' sel' : ''}`}
                    onClick={() => { setPlayerFilter(opt); setPlayerOpen(false) }}
                  >{opt}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="archive-list">
          {ARCHIVE_DATA.map((d, i) => (
            <div
              key={i}
              className={`archive-card${selected === i ? ' selected' : ''}`}
              onClick={() => setSelected(i)}
            >
              <div className="card-thumb">
                <div className="thumb-bg" />
                <img className="thumb-player" src="/images/players/오타니.png" alt="swing thumbnail" />
                <div className="thumb-overlay" />
                <div className="thumb-play">
                  <div className="play-circle"><div className="play-tri" /></div>
                  <span className="thumb-dur">00:07</span>
                </div>
              </div>

              <div className="card-content">
                <div className="card-datetime">{d.date} · {d.time}</div>
                <div className="card-player-row">
                  <span className="card-player-name">{d.player}</span>
                  <span className="card-sep">·</span>
                  <span className="card-team">{d.team}</span>
                </div>
                <div className="card-stats">
                  <div className="stat-badge">
                    <span className="stat-label">Bat Speed</span>
                    <span className="stat-value">{d.batSpeed}<span className="stat-unit"> mph</span></span>
                  </div>
                  <div className="stat-badge">
                    <span className="stat-label">Attack Angle</span>
                    <span className="stat-value">{d.attackAngle}<span className="stat-unit">°</span></span>
                  </div>
                  <div className="stat-badge">
                    <span className="stat-label">Swing Path Tilt</span>
                    <span className="stat-value">{d.swingTilt}<span className="stat-unit">°</span></span>
                  </div>
                </div>
              </div>

              <div className="card-arrow">›</div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import './CalendarPage.css'

const VISIT_DATA = {
  '2026-2': [3,5,8,12,15,18,20,22,25],
  '2026-3': [2,4,6,10,11,12,14,16,18,19,21,23,24,25,26,27,28,30],
  '2026-4': [1,3,6,8,10,13,15,17,20,22,24,27,29],
  '2026-5': [2,5,7,10,12,14,17,19,21,24],
}
const ANALYZE_DATA = {
  '2026-2': [5,12,20,25],
  '2026-3': [2,6,10,14,18,21,25,28],
  '2026-4': [3,8,15,22,29],
  '2026-5': [5,12,19,24],
}

const TODAY = new Date()

function buildCells(year, month) {
  const key = `${year}-${month}`
  const visits   = new Set(VISIT_DATA[key]   || [])
  const analyzes = new Set(ANALYZE_DATA[key] || [])
  const firstDay  = new Date(year, month - 1, 1).getDay()
  const lastDate  = new Date(year, month, 0).getDate()
  const prevLast  = new Date(year, month - 1, 0).getDate()
  const total     = Math.ceil((firstDay + lastDate) / 7) * 7

  return Array.from({ length: total }, (_, i) => {
    let dayNum, isOther = false
    if (i < firstDay) {
      dayNum = prevLast - firstDay + i + 1; isOther = true
    } else if (i >= firstDay + lastDate) {
      dayNum = i - firstDay - lastDate + 1; isOther = true
    } else {
      dayNum = i - firstDay + 1
    }
    const col        = i % 7
    const isVisited  = !isOther && visits.has(dayNum)
    const isAnalyzed = !isOther && analyzes.has(dayNum)
    const isToday    = !isOther
      && dayNum === TODAY.getDate()
      && month  === TODAY.getMonth() + 1
      && year   === TODAY.getFullYear()
    return { dayNum, isOther, isSun: col === 0, isSat: col === 6, isVisited, isAnalyzed, isToday }
  })
}

export default function CalendarPage() {
  const navigate = useNavigate()
  const [year,  setYear]  = useState(2026)
  const [month, setMonth] = useState(5)

  function changeMonth(delta) {
    let m = month + delta, y = year
    if (m > 12) { m = 1; y++ }
    if (m < 1)  { m = 12; y-- }
    setMonth(m); setYear(y)
  }

  const cells = buildCells(year, month)

  return (
    <div className="calendar-page">
      <div className="calendar-bg" />
      <Nav />

      <div className="cal-main">
        <button className="cal-back-btn" onClick={() => navigate('/home')}>← 홈으로 돌아가기</button>

        <div className="cal-top-row">
          <div className="cal-title-area">
            <h1 className="cal-page-title">캘린더</h1>
            <p className="cal-page-subtitle">나의 훈련 기록을 확인하세요</p>
          </div>

          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-icon">🔥</div>
              <div className="summary-body">
                <span className="summary-label">연속 출석일</span>
                <span className="summary-value"><span className="val-gold">23</span>일</span>
                <span className="summary-sub">스트릭</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">
                <svg viewBox="0 0 38 38" fill="none">
                  <rect x="4"  y="22" width="6" height="12" rx="1.5" fill="rgba(255,255,255,0.55)"/>
                  <rect x="13" y="15" width="6" height="19" rx="1.5" fill="rgba(255,255,255,0.55)"/>
                  <rect x="22" y="9"  width="6" height="25" rx="1.5" fill="rgba(255,255,255,0.55)"/>
                  <rect x="31" y="4"  width="6" height="30" rx="1.5" fill="rgba(255,255,255,0.55)"/>
                </svg>
              </div>
              <div className="summary-body">
                <span className="summary-label">총 분석 횟수</span>
                <span className="summary-value">47<span style={{fontSize:'0.65em',fontWeight:700,color:'rgba(255,255,255,0.75)',marginLeft:'2px'}}>회</span></span>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">
                <svg viewBox="0 0 38 38" fill="none">
                  <rect x="3" y="7" width="32" height="28" rx="3" stroke="rgba(255,255,255,0.55)" strokeWidth="2"/>
                  <path d="M3 15h32" stroke="rgba(255,255,255,0.55)" strokeWidth="2"/>
                  <path d="M11 3v8M27 3v8" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round"/>
                  <rect x="9"  y="20" width="5" height="5" rx="1" fill="rgba(255,255,255,0.45)"/>
                  <rect x="17" y="20" width="5" height="5" rx="1" fill="rgba(255,255,255,0.45)"/>
                  <rect x="25" y="20" width="5" height="5" rx="1" fill="rgba(255,255,255,0.45)"/>
                  <rect x="9"  y="28" width="5" height="5" rx="1" fill="rgba(255,255,255,0.35)"/>
                  <rect x="17" y="28" width="5" height="5" rx="1" fill="rgba(255,255,255,0.35)"/>
                </svg>
              </div>
              <div className="summary-body">
                <span className="summary-label">이번 달 접속일</span>
                <span className="summary-value">18<span style={{fontSize:'0.65em',fontWeight:700,color:'rgba(255,255,255,0.75)',marginLeft:'2px'}}>일</span></span>
              </div>
            </div>
          </div>
        </div>

        <div className="cal-card">
          <div className="cal-header">
            <button className="cal-nav-btn" onClick={() => changeMonth(-1)}>
              <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
                <path d="M8.5 1.5L2 8l6.5 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <span className="cal-month-label">{year}년 {month}월</span>
            <button className="cal-nav-btn" onClick={() => changeMonth(1)}>
              <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
                <path d="M1.5 1.5L8 8l-6.5 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className="cal-weekdays">
            {['일','월','화','수','목','금','토'].map((d, i) => (
              <div key={d} className={`cal-wd${i===0?' sun':i===6?' sat':''}`}>{d}</div>
            ))}
          </div>

          <div className="cal-grid">
            {cells.map((c, i) => {
              let cls = 'cal-cell'
              if (c.isOther) cls += ' other-month'
              else if (c.isSun) cls += ' sun'
              else if (c.isSat) cls += ' sat'
              if (c.isAnalyzed) cls += ' analyzed'
              else if (c.isVisited) cls += ' visited'
              if (c.isToday) cls += ' today'
              return (
                <div key={i} className={cls}>
                  <div className="day-num">{c.dayNum}</div>
                  {c.isAnalyzed && <div className="baseball-badge">⚾</div>}
                </div>
              )
            })}
          </div>

          <div className="cal-legend">
            <div className="legend-item">
              <div className="legend-dot visited" />
              <span>접속한 날</span>
            </div>
            <div className="legend-item">
              <span className="legend-baseball">⚾</span>
              <span>분석한 날</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot today" />
              <span>오늘</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

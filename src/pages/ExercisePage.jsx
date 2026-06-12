import { useMemo, useRef, useState } from 'react';
import './ExercisePage.css';
import { GYM_DATA } from './data/gymData';
import { HOME_DATA } from './data/homeData';
import { STAT_GAPS } from './data/statGaps';

/* ── SVG 썸네일 맵 ── */
const THUMB_SVGS = {
  'gym-1': <svg width="68" height="56" viewBox="0 0 68 56" fill="none"><ellipse cx="34" cy="9" rx="5" ry="5" fill="rgba(255,255,255,0.22)"/><path d="M34 14L34 30" stroke="rgba(255,255,255,0.22)" strokeWidth="5" strokeLinecap="round"/><path d="M34 30L26 50" stroke="rgba(255,255,255,0.18)" strokeWidth="4" strokeLinecap="round"/><path d="M34 30L42 50" stroke="rgba(255,255,255,0.18)" strokeWidth="4" strokeLinecap="round"/><path d="M28 20L14 28" stroke="rgba(255,255,255,0.18)" strokeWidth="3.5" strokeLinecap="round"/><path d="M40 20L54 28" stroke="rgba(255,255,255,0.18)" strokeWidth="3.5" strokeLinecap="round"/><line x1="8" y1="50" x2="60" y2="50" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeDasharray="3,3"/></svg>,
  'gym-2': <svg width="68" height="56" viewBox="0 0 68 56" fill="none"><ellipse cx="24" cy="11" rx="5" ry="5" fill="rgba(255,255,255,0.22)"/><path d="M24 16L28 30" stroke="rgba(255,255,255,0.22)" strokeWidth="5" strokeLinecap="round"/><path d="M28 30L20 50" stroke="rgba(255,255,255,0.18)" strokeWidth="4" strokeLinecap="round"/><path d="M28 30L38 46" stroke="rgba(255,255,255,0.18)" strokeWidth="4" strokeLinecap="round"/><path d="M22 22L10 26" stroke="rgba(255,255,255,0.18)" strokeWidth="3.5" strokeLinecap="round"/><path d="M28 20L42 16" stroke="rgba(255,255,255,0.2)" strokeWidth="3.5" strokeLinecap="round"/><circle cx="52" cy="20" r="7" fill="rgba(232,184,75,0.18)" stroke="rgba(232,184,75,0.4)" strokeWidth="1.5"/></svg>,
  'gym-3': <svg width="68" height="56" viewBox="0 0 68 56" fill="none"><ellipse cx="34" cy="11" rx="5" ry="5" fill="rgba(255,255,255,0.22)"/><path d="M34 16L34 28" stroke="rgba(255,255,255,0.22)" strokeWidth="5" strokeLinecap="round"/><path d="M34 28L26 42" stroke="rgba(255,255,255,0.18)" strokeWidth="4" strokeLinecap="round"/><path d="M34 28L50 44" stroke="rgba(255,255,255,0.18)" strokeWidth="4" strokeLinecap="round"/><rect x="22" y="42" width="14" height="5" rx="2" fill="rgba(255,255,255,0.1)"/><path d="M28 22L12 10" stroke="rgba(255,255,255,0.2)" strokeWidth="3.5" strokeLinecap="round"/><rect x="56" y="5" width="5" height="42" rx="2" fill="rgba(255,255,255,0.1)"/></svg>,
  'gym-4': <svg width="68" height="56" viewBox="0 0 68 56" fill="none"><ellipse cx="36" cy="10" rx="5" ry="5" fill="rgba(255,255,255,0.22)"/><path d="M36 15L36 28" stroke="rgba(255,255,255,0.22)" strokeWidth="5" strokeLinecap="round"/><path d="M36 28L30 50" stroke="rgba(255,255,255,0.18)" strokeWidth="4" strokeLinecap="round"/><path d="M36 28L52 44" stroke="rgba(255,255,255,0.14)" strokeWidth="3" strokeLinecap="round" strokeDasharray="3,2"/><path d="M30 22L16 28" stroke="rgba(255,255,255,0.18)" strokeWidth="3.5" strokeLinecap="round"/><path d="M42 22L52 26" stroke="rgba(255,255,255,0.18)" strokeWidth="3.5" strokeLinecap="round"/></svg>,
  'gym-5': <svg width="68" height="56" viewBox="0 0 68 56" fill="none"><ellipse cx="34" cy="10" rx="5" ry="5" fill="rgba(255,255,255,0.22)"/><path d="M34 15L34 26" stroke="rgba(255,255,255,0.22)" strokeWidth="5" strokeLinecap="round"/><path d="M34 26L18 40" stroke="rgba(255,255,255,0.18)" strokeWidth="4" strokeLinecap="round"/><path d="M34 26L50 34" stroke="rgba(255,255,255,0.18)" strokeWidth="4" strokeLinecap="round"/><path d="M18 40L14 52" stroke="rgba(255,255,255,0.18)" strokeWidth="4" strokeLinecap="round"/><path d="M50 34L56 50" stroke="rgba(255,255,255,0.14)" strokeWidth="3" strokeLinecap="round" strokeDasharray="3,2"/><path d="M28 21L16 21" stroke="rgba(255,255,255,0.18)" strokeWidth="3.5" strokeLinecap="round"/><path d="M40 21L52 21" stroke="rgba(255,255,255,0.18)" strokeWidth="3.5" strokeLinecap="round"/></svg>,
  'home-1': <svg width="68" height="56" viewBox="0 0 68 56" fill="none"><ellipse cx="34" cy="9" rx="5" ry="5" fill="rgba(255,255,255,0.22)"/><path d="M34 14L34 24" stroke="rgba(255,255,255,0.22)" strokeWidth="5" strokeLinecap="round"/><path d="M34 24L16 36" stroke="rgba(255,255,255,0.2)" strokeWidth="5" strokeLinecap="round"/><path d="M34 24L46 20" stroke="rgba(255,255,255,0.16)" strokeWidth="3" strokeLinecap="round"/><path d="M34 24L30 46" stroke="rgba(255,255,255,0.18)" strokeWidth="4" strokeLinecap="round"/><path d="M34 24L40 46" stroke="rgba(255,255,255,0.18)" strokeWidth="4" strokeLinecap="round"/></svg>,
  'home-2': <svg width="68" height="56" viewBox="0 0 68 56" fill="none"><ellipse cx="22" cy="10" rx="5" ry="5" fill="rgba(255,255,255,0.22)"/><path d="M22 15L24 28" stroke="rgba(255,255,255,0.22)" strokeWidth="5" strokeLinecap="round"/><path d="M24 28L16 48" stroke="rgba(255,255,255,0.18)" strokeWidth="4" strokeLinecap="round"/><path d="M24 28L36 44" stroke="rgba(255,255,255,0.18)" strokeWidth="4" strokeLinecap="round"/><path d="M26 18L42 12" stroke="rgba(255,255,255,0.18)" strokeWidth="3" strokeLinecap="round"/><path d="M42 12 Q52 7 56 16" stroke="rgba(232,184,75,0.6)" strokeWidth="2" strokeLinecap="round" fill="none"/><circle cx="56" cy="16" r="3" fill="rgba(232,184,75,0.25)" stroke="rgba(232,184,75,0.5)" strokeWidth="1.2"/></svg>,
  'home-3': <svg width="68" height="56" viewBox="0 0 68 56" fill="none"><ellipse cx="50" cy="16" rx="5" ry="5" fill="rgba(255,255,255,0.22)"/><path d="M14 46L54 28" stroke="rgba(255,255,255,0.2)" strokeWidth="6" strokeLinecap="round"/><path d="M50 28L56 13" stroke="rgba(255,255,255,0.2)" strokeWidth="3.5" strokeLinecap="round"/><path d="M14 46L8 40" stroke="rgba(255,255,255,0.16)" strokeWidth="3" strokeLinecap="round"/><path d="M14 46L10 52" stroke="rgba(255,255,255,0.16)" strokeWidth="3" strokeLinecap="round"/></svg>,
  'home-4': <svg width="68" height="56" viewBox="0 0 68 56" fill="none"><ellipse cx="10" cy="22" rx="5" ry="5" fill="rgba(255,255,255,0.22)"/><path d="M10 27L10 40" stroke="rgba(255,255,255,0.22)" strokeWidth="5" strokeLinecap="round"/><path d="M10 30L4 19" stroke="rgba(255,255,255,0.18)" strokeWidth="3.5" strokeLinecap="round"/><path d="M10 30L20 19" stroke="rgba(255,255,255,0.18)" strokeWidth="3.5" strokeLinecap="round"/><path d="M10 40L6 52" stroke="rgba(255,255,255,0.18)" strokeWidth="4" strokeLinecap="round"/><path d="M10 40L34 46" stroke="rgba(232,184,75,0.4)" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="4,2"/><circle cx="38" cy="20" r="2.5" fill="rgba(232,184,75,0.3)"/></svg>,
  'home-5': <svg width="68" height="56" viewBox="0 0 68 56" fill="none"><ellipse cx="34" cy="10" rx="5" ry="5" fill="rgba(255,255,255,0.22)"/><path d="M34 15L34 26" stroke="rgba(255,255,255,0.22)" strokeWidth="5" strokeLinecap="round"/><path d="M34 26L18 40" stroke="rgba(255,255,255,0.18)" strokeWidth="4" strokeLinecap="round"/><path d="M34 26L50 34" stroke="rgba(255,255,255,0.18)" strokeWidth="4" strokeLinecap="round"/><path d="M18 40L14 52" stroke="rgba(255,255,255,0.18)" strokeWidth="4" strokeLinecap="round"/><path d="M28 21L16 21" stroke="rgba(255,255,255,0.18)" strokeWidth="3.5" strokeLinecap="round"/><path d="M40 21L52 21" stroke="rgba(255,255,255,0.18)" strokeWidth="3.5" strokeLinecap="round"/></svg>,
};

const Stars = ({ count, total = 5 }) =>
  Array.from({ length: total }, (_, i) => (
    <span key={i} className={i < count ? 'star-f' : 'star-e'}>★</span>
  ));

function applyPriority(data, statGaps) {
  const gapMap = Object.fromEntries(statGaps.map(s => [s.label, Number(s.gap) || 0]));

  return [...data]
    .sort((a, b) => (gapMap[b.stat] ?? 0) - (gapMap[a.stat] ?? 0))
    .map((ex, idx) => ({
      ...ex,
      priority: idx < 2 ? 1 : idx < 4 ? 2 : 3,
      priorityLabel: idx < 2 ? `★★★ ${idx + 1}순위` : idx < 4 ? `★★ ${idx + 1}순위` : `★ ${idx + 1}순위`,
      priorityClass: idx < 2 ? 'priority-1' : idx < 4 ? 'priority-2' : 'priority-3',
    }));
}

/**
 * ExercisePage
 *
 * Props:
 *   mode         {'gym'|'home'}  현재 모드 (controlled 시 사용)
 *   onModeChange {Function}     모드 변경 콜백
 *   onBack       {Function}     분석 리포트로 돌아가기 콜백
 *   statGaps     {Array}        MLB 비교 스탯 갭 배열 (선택, 기본값: STAT_GAPS 플레이스홀더)
 */
export default function ExercisePage({ mode: modeProp, onModeChange, onBack, statGaps = STAT_GAPS }) {
  const [internalMode, setInternalMode] = useState('gym');
  const isControlled = modeProp !== undefined;
  const mode = isControlled ? modeProp : internalMode;

  const handleModeChange = (m) => {
    if (!isControlled) setInternalMode(m);
    onModeChange?.(m);
  };

  const sourceData = mode === 'gym' ? GYM_DATA : HOME_DATA;
  const data = useMemo(() => applyPriority(sourceData, statGaps), [sourceData, statGaps]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const rightPanelRef = useRef(null);
  const prevMode = useRef(mode);

  if (prevMode.current !== mode) {
    prevMode.current = mode;
    setSelectedIdx(0);
  }

  const selected = data[selectedIdx];
  const isHome = mode === 'home';

  const handleSelect = (idx) => {
    setSelectedIdx(idx);
    rightPanelRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="exercise-page">
      <div className="page-bg" />

      <button className="back-btn" onClick={onBack}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M8 1L3 6L8 11" stroke="#e8b84b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        분석 리포트로 돌아가기
      </button>

      {/* 헬스장 / 홈트 모드 토글 */}
      <div className="mode-toggle">
        <button className={`mode-btn${mode === 'gym' ? ' active' : ''}`} onClick={() => handleModeChange('gym')}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4">
            <rect x="1" y="2" width="10" height="8" rx="1.5"/><line x1="4" y1="2" x2="4" y2="10"/><line x1="8" y1="2" x2="8" y2="10"/>
          </svg>
          헬스장
        </button>
        <div className="mode-divider" />
        <button className={`mode-btn${mode === 'home' ? ' active' : ''}`} onClick={() => handleModeChange('home')}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M6 1L1 4.5V11H4.5V7.5H7.5V11H11V4.5L6 1Z" strokeLinejoin="round"/>
          </svg>
          홈트
        </button>
      </div>

      <div className="layout">
        {/* ═══ 좌측 패널 ═══ */}
        <div className="left-panel">
          <div className="left-header">
            <div className="left-title-row">
              <div className="title-icon">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="#e8b84b">
                  <polygon points="6.5,0.5 8.1,4.6 12.5,4.8 9.3,7.6 10.4,12 6.5,9.6 2.6,12 3.7,7.6 0.5,4.8 4.9,4.6"/>
                </svg>
              </div>
              <span className="left-title">{isHome ? '홈트 운동 추천' : '맞춤 운동 추천'}</span>
            </div>
            <div className="left-subtitle">
              {isHome ? '기구 없이 집에서 할 수 있는 맞춤 훈련' : '스윙 분석 결과 기반 우선순위 추천'}
            </div>
          </div>

          {isHome && (
            <div className="banner home-banner">
              <div className="banner-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="rgba(100,220,160,0.8)" strokeWidth="1.5">
                  <path d="M8 1.5L1.5 6V14.5H6V10H10V14.5H14.5V6L8 1.5Z" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="banner-text">
                <strong>기구 없이 집에서 OK.</strong> 모든 운동은 맨바닥과 수건 하나면 충분해요.
              </div>
            </div>
          )}

          <div className="banner priority-banner">
            <div className="banner-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#e8b84b" strokeWidth="1.5">
                <circle cx="8" cy="8" r="6.5"/><line x1="8" y1="5" x2="8" y2="8.5" strokeLinecap="round"/><circle cx="8" cy="11" r="0.6" fill="#e8b84b" strokeWidth="0"/>
              </svg>
            </div>
            <div className="banner-text">
              MLB 비교 분석 결과를 바탕으로 <strong>부족한 스탯 순서</strong>대로 추천드려요.
            </div>
          </div>

          <div className="left-divider" />

          {data.map((ex, idx) => (
            <div key={ex.id} className={`ex-card${selectedIdx === idx ? ' selected' : ''}`} onClick={() => handleSelect(idx)}>
              <span className={`priority-badge ${ex.priorityClass}`}>{ex.priorityLabel}</span>
              {isHome && ex.equip && (
                <span className="home-mode-badge">🏠 {ex.equip.replace('✓ ', '')}</span>
              )}
              <div className="ex-thumb">
                <div className="ex-thumb-inner" style={{ background: ex.thumbBg }}>
                  {THUMB_SVGS[ex.id]}
                </div>
              </div>
              <div className="ex-info">
                <div className="ex-name-row">
                  <div className="ex-name">
                    {ex.name}
                    {ex.nameEn && <span className="ex-name-en">({ex.nameEn})</span>}
                  </div>
                </div>
                <div className="ex-tags">
                  <span className="ex-tag">{ex.tags[0]}</span>
                  {ex.tags[1] && <span className="ex-tag secondary">{ex.tags[1]}</span>}
                </div>
                <div className="ex-desc">{ex.cardDesc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ═══ 우측 패널 ═══ */}
        <div className="right-panel" ref={rightPanelRef}>

          {/* 스탯 갭 바 */}
          <div className="stat-gap-bar">
            <div className="stat-gap-title">나의 스탯 갭 — MLB 비교</div>
            {statGaps.map((s) => (
              <div key={s.label} className="stat-gap-row">
                <span className="stat-gap-label">{s.label}</span>
                <div className="stat-gap-track">
                  <div className={`stat-gap-fill ${s.colorClass}`} style={{ width: `${s.gap}%` }} />
                </div>
                <span className="stat-gap-val">-{s.gap}%</span>
              </div>
            ))}
          </div>

          {/* 비디오 플레이어 */}
          <div className="video-wrap">
            <div className="video-canvas">
              <svg width="50%" viewBox="0 0 220 130" fill="none">
                <rect x="28" y="52" width="164" height="22" rx="5" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                <ellipse cx="110" cy="38" rx="13" ry="13" fill="rgba(255,255,255,0.16)"/>
                <rect x="90" y="49" width="40" height="18" rx="5" fill="rgba(255,255,255,0.16)"/>
                <path d="M90 56L82 40" stroke="rgba(255,255,255,0.14)" strokeWidth="4" strokeLinecap="round"/>
                <path d="M130 56L138 40" stroke="rgba(255,255,255,0.14)" strokeWidth="4" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="video-badge">{selected.badge}</div>
            {isHome && (
              <div className="video-home-badge">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M5.5 1L1 4V10H4V7H7V10H10V4L5.5 1Z" strokeLinejoin="round"/>
                </svg>
                기구 불필요
              </div>
            )}
            <div className="video-play-overlay">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <polygon points="7,4 18,10 7,16" fill="rgba(255,255,255,0.9)"/>
              </svg>
            </div>
            <div className="video-ctrl">
              <button className="ctrl-btn">
                <svg width="17" height="17" viewBox="0 0 17 17" fill="rgba(255,255,255,0.8)"><polygon points="3,2 14,8.5 3,15"/></svg>
              </button>
              <span className="ctrl-time">0:00 / 2:00</span>
              <div className="ctrl-progress"><div className="ctrl-fill"/><div className="ctrl-dot"/></div>
              <div className="ctrl-right">
                <button className="ctrl-btn">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.3"><path d="M1.5 5H6.5L10 2V14L6.5 11H1.5V5Z"/><path d="M12 5C13.2 6 14 7.4 14 8C14 8.6 13.2 10 12 11"/></svg>
                </button>
                <button className="ctrl-btn">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.3"><path d="M2 5V2H5M11 2H14V5M14 11V14H11M5 14H2V11"/></svg>
                </button>
              </div>
            </div>
          </div>

          {/* 상세 헤더 */}
          <div className="detail-header">
            <div>
              <div className="detail-name">{selected.name}</div>
              <div className="detail-short">{selected.short}</div>
              {isHome && selected.equip && (
                <div className="equipment-row">
                  <span className="equipment-label">필요 기구</span>
                  <span className="equipment-chip">{selected.equip}</span>
                </div>
              )}
            </div>
            <div className="detail-right">
              <span className="diff-label">난이도</span>
              <div className="diff-stars"><Stars count={selected.diff} /></div>
              <span className="diff-badge">{selected.diffText}</span>
            </div>
          </div>

          <div className="info-sections">
            {/* 수행 방법 */}
            <div className="info-card">
              <div className="info-card-hd">
                <div className="info-icon">
                  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="#e8b84b" strokeWidth="1.6"><rect x="3" y="2" width="11" height="13" rx="2"/><line x1="5.5" y1="6" x2="11.5" y2="6" strokeLinecap="round"/><line x1="5.5" y1="8.8" x2="11.5" y2="8.8" strokeLinecap="round"/><line x1="5.5" y1="11.5" x2="9.5" y2="11.5" strokeLinecap="round"/></svg>
                </div>
                <span className="info-card-title">운동 수행 방법</span>
              </div>
              <div className="info-body">
                <ol>{selected.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
                <div className="point-box">
                  <span className="point-box-icon">💡</span>
                  <span className="point-box-text">{selected.point}</span>
                </div>
                {isHome && selected.sets && (
                  <div className="set-guide">
                    {selected.sets.map((s, i) => (
                      <div key={i} className="set-item">
                        <div className="set-item-val">{s.val}</div>
                        <div className="set-item-label">{s.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 타겟 근육 */}
            <div className="info-card">
              <div className="info-card-hd">
                <div className="info-icon">
                  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="#e8b84b" strokeWidth="1.6"><path d="M8.5 2C8.5 2 12 4.5 12 8.5C12 11 10.5 13 8.5 15C6.5 13 5 11 5 8.5C5 4.5 8.5 2 8.5 2Z"/><path d="M5.5 7C5.5 7 3 6 2 8C2 8 3 11 5.5 11" strokeLinecap="round"/><path d="M11.5 7C11.5 7 14 6 15 8C15 8 14 11 11.5 11" strokeLinecap="round"/></svg>
                </div>
                <span className="info-card-title">타겟 근육</span>
              </div>
              <div className="info-body">
                <div className="muscle-tags">
                  {selected.muscles.map((m, i) => (
                    <span key={i} className={`muscle-tag${m.main ? ' main' : ''}`}>{m.name}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* 기대 효과 */}
            <div className="info-card">
              <div className="info-card-hd">
                <div className="info-icon">
                  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="#e8b84b" strokeWidth="1.6"><circle cx="8.5" cy="8.5" r="6.5"/><path d="M5.5 8.5L7.5 11L12 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span className="info-card-title">어떤 역량을 키울 수 있나요?</span>
              </div>
              <div className="info-body">
                <p>{selected.effectIntro}</p>
                <ul style={{ marginTop: '10px' }}>
                  {selected.effects.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
                <div className="paper-ref">
                  {selected.papers.map((p, i) => <span key={i} className="paper-chip">📄 {p}</span>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

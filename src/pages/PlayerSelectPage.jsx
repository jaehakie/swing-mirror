import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './PlayerSelectPage.css'
import { analyzeSwing } from '../api'
import { getUploadedSwing } from '../swingSession'

const KBO_PLAYERS = [
  { id: 'lee_seung_yeop', label: '이승엽', nameEn: 'Lee Seung-yeop', team: 'Samsung Lions', color: '#1A6BFF', logo: '삼성', image: '이승엽', num: '01', extraCard: 'logo-top logo-xl player-fit', extraBg: 'rgba(4,13,31,0.38)' },
  { id: 'lee_dae_ho', label: '이대호', nameEn: 'Lee Dae-ho', team: 'Lotte Giants', color: '#FF3355', logo: '롯데', image: '이대호', num: '02', extraCard: 'logo-top logo-xl', extraBg: 'rgba(26,3,8,0.38)' },
  { id: 'kim_tae_kyun', label: '김태균', nameEn: 'Kim Tae-kyun', team: 'Hanwha Eagles', color: '#FF8800', logo: '한화', image: '김태균', num: '03', extraCard: 'player-fit', extraBg: 'rgba(26,12,0,0.38)' },
  { id: 'park_byung_ho', label: '박병호', nameEn: 'Park Byung-ho', team: 'Kiwoom Heroes', color: '#CC2244', logo: '키움', image: '박병호', num: '04', extraCard: 'logo-top logo-kiwoom', extraBg: 'rgba(21,0,5,0.38)' },
  { id: 'park_yong_taik', label: '박용택', nameEn: 'Park Yong-taik', team: 'LG Twins', color: '#DD2244', logo: '엘지', image: '박용택', num: '05', extraCard: '', extraBg: 'rgba(26,3,8,0.38)' },
  { id: 'yang_eui_ji', label: '양의지', nameEn: 'Yang Eui-ji', team: 'Doosan Bears', color: '#3366CC', logo: '두산', image: '양의지', num: '06', extraCard: '', extraBg: 'rgba(1,13,26,0.38)' },
  { id: 'lee_jong_beom', label: '이종범', nameEn: 'Lee Jong-beom', team: 'KIA Tigers', color: '#FF2233', logo: '기아', image: '이종범', num: '07', extraCard: 'player-up logo-top-kia', extraBg: 'rgba(26,0,5,0.38)' },
  { id: 'choi_jeong', label: '최정', nameEn: 'Choi Jeong', team: 'SSG Landers', color: '#EE1133', logo: '쓱', image: '최정', num: '08', extraCard: '', extraBg: 'rgba(26,2,5,0.38)' },
  { id: 'ahn_hyeon_min', label: '안현민', nameEn: 'Ahn Hyeon-min', team: 'KT Wiz', color: '#CC0022', logo: '케이티', image: '안현민', num: '09', extraCard: '', extraBg: 'rgba(13,0,5,0.38)' },
  { id: 'park_min_woo', label: '박민우', nameEn: 'Park Min-woo', team: 'NC Dinos', color: '#4477DD', logo: '엔씨', image: '박민우', num: '10', extraCard: '', extraBg: 'rgba(1,10,26,0.38)' },
]

const MLB_PLAYERS = [
  { id: 'ohtani', label: '오타니 쇼헤이', nameEn: 'Shohei Ohtani', team: 'Los Angeles Dodgers', color: '#4499FF', logo: '다저스', image: '오타니', badge: 'MLB', extraCard: '', extraBg: 'rgba(0,9,26,0.38)' },
  { id: 'lee_jung_hoo', label: '이정후', nameEn: 'Lee Jung-hoo · OF', team: 'San Francisco Giants', color: '#FF7733', logo: '샌프란시스코', image: '이정후', badge: 'MLB', extraCard: '', extraBg: 'rgba(26,8,0,0.38)', badgeColor: '#ff7733' },
]

export default function PlayerSelectPage() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  function selectCard(player) {
    if (player.disabled) return
    setSelected(prev => prev === player.id ? null : player.id)
  }

  async function handleStart() {
    if (!selected || submitting) return

    const file = getUploadedSwing()
    const impactFrame = Number(sessionStorage.getItem('impactFrame') || -1)
    const userHanded = sessionStorage.getItem('userHanded') || 'right'

    if (!file) {
      alert('업로드한 영상 파일을 찾을 수 없습니다. 다시 업로드해주세요.')
      navigate('/upload')
      return
    }

    try {
      setSubmitting(true)
      sessionStorage.setItem('referencePlayer', selected)
      const { job_id } = await analyzeSwing(file, selected, impactFrame, userHanded)
      navigate('/analyzing', { state: { jobId: job_id } })
    } catch (error) {
      setSubmitting(false)
      alert(error.message)
    }
  }

  return (
    <div className="select-page">
      <div className="select-bg" />

      <div className="select-content">
        <div className="select-header">
          <button className="select-back-btn" onClick={() => navigate('/upload')}>&#8592; 뒤로</button>
        </div>

        <div className="select-title-area">
          <h1>레퍼런스 선수를 선택하세요</h1>
          <p>기준 JSON이 준비된 선수와 사용자의 스윙을 비교합니다.</p>
        </div>

        <div className="select-grid-wrap">
          <div className="kbo-grid">
            {KBO_PLAYERS.map(p => (
              <PlayerCard
                key={p.id}
                player={p}
                type="kbo"
                isSelected={selected === p.id}
                onSelect={selectCard}
              />
            ))}
          </div>
          <div className="mlb-grid">
            {MLB_PLAYERS.map(p => (
              <PlayerCard
                key={p.id}
                player={p}
                type="mlb"
                isSelected={selected === p.id}
                onSelect={selectCard}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="select-footer">
        <button className="start-btn" disabled={!selected || submitting} onClick={handleStart}>
          {submitting ? '분석 요청 중...' : '분석 시작 →'}
        </button>
        <div className="footer-note">선택한 선수의 기준 JSON과 사용자 스윙을 비교합니다.</div>
      </div>
    </div>
  )
}

function PlayerCard({ player, type, isSelected, onSelect }) {
  const { label, nameEn, team, color, logo, image, num, badge, badgeColor, extraCard, extraBg, disabled } = player

  const cardStyle = isSelected
    ? { boxShadow: `0 0 28px ${color}99, 0 0 60px ${color}33`, borderColor: color }
    : disabled
      ? { opacity: 0.45, cursor: 'not-allowed' }
      : {}

  return (
    <div
      className={`player-card ${type} ${extraCard || ''} ${isSelected ? 'selected' : ''}`}
      style={cardStyle}
      onClick={() => onSelect(player)}
    >
      <div className="card-bg" style={{ background: extraBg }} />
      <div className="card-logo">
        <img src={`/images/logos/${logo}.png`} alt={logo} />
      </div>
      <div className="card-player">
        <img src={`/images/players/${image}.png`} alt={label} />
      </div>
      <div className="card-gradient" />
      {num && <div className="card-num">{num}</div>}
      {badge && (
        <div className="card-badge" style={badgeColor ? { background: badgeColor } : {}}>
          {badge}
        </div>
      )}
      <div className="card-check">✓</div>
      <div className="card-info">
        <div className={`player-name-ko ${type === 'mlb' ? 'mlb-name' : ''}`}>{label}</div>
        <div className={`player-name-en ${type === 'mlb' ? 'mlb-name-en' : ''}`}>{nameEn}</div>
        <div className={`player-team ${type === 'mlb' ? 'mlb-team' : ''}`} style={{ color }}>{team}</div>
      </div>
    </div>
  )
}

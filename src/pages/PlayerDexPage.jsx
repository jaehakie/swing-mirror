import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import './PlayerDexPage.css'

const KBO_PLAYERS = [
  { id: '이승엽', nameEn: 'Lee Seung-yeop', team: '삼성 라이온즈', teamColor: '#4488ff', logo: '삼성', img: '이승엽', num: '01', position: '1루수', extraBg: 'rgba(4,13,31,0.38)', logoClass: 'logo-top logo-xl', playerClass: 'player-fit', stats: ['KBO 통산 467홈런, 한일통산 626홈런', '한 시즌 56홈런 아시아 최고 기록', 'KBO MVP 5회, 골든글러브 10회', '한국시리즈 4회 우승 · 등번호 36번 영구결번'] },
  { id: '이대호', nameEn: 'Lee Dae-ho', team: '롯데 자이언츠', teamColor: '#ff4466', logo: '롯데', img: '이대호', num: '02', position: '1루수·3루수', extraBg: 'rgba(26,3,8,0.38)', logoClass: 'logo-top logo-xl', playerClass: '', stats: ['KBO 통산 374홈런, 2199안타', 'KBO MVP 1회, 골든글러브 7회', '타격 7관왕, 트리플크라운 2회', '일본시리즈 MVP · 롯데 영구결번'] },
  { id: '김태균', nameEn: 'Kim Tae-kyun', team: '한화 이글스', teamColor: '#ff9922', logo: '한화', img: '김태균', num: '03', position: '1루수', extraBg: 'rgba(26,12,0,0.38)', logoClass: '', playerClass: 'player-fit', stats: ['KBO 통산 200홈런 이상, 2000안타 이상', '골든글러브 3회', '일본 지바롯데 진출', 'NPB 올스타 팬투표 퍼시픽리그 최다득표'] },
  { id: '박병호', nameEn: 'Park Byung-ho', team: '키움 히어로즈', teamColor: '#dd3355', logo: '키움', img: '박병호', num: '04', position: '1루수', extraBg: 'rgba(21,0,5,0.38)', logoClass: 'logo-top logo-kiwoom', playerClass: '', stats: ['KBO 통산 418홈런', '홈런왕 6회, MVP 2회, 골든글러브 5회', 'KBO 최초 2년 연속 50홈런', 'MLB 미네소타 트윈스 진출'] },
  { id: '박용택', nameEn: 'Park Yong-taik', team: 'LG 트윈스', teamColor: '#ee3355', logo: '엘지', img: '박용택', num: '05', position: '외야수', extraBg: 'rgba(26,3,8,0.38)', logoClass: '', playerClass: '', stats: ['KBO 역대 최다 2504안타', '골든글러브 3회 · 10년 연속 3할 타율', 'KBO 최초 200홈런-300도루 동시 달성', 'LG 트윈스 영구결번'] },
  { id: '양의지', nameEn: 'Yang Eui-ji', team: '두산 베어스', teamColor: '#4488ee', logo: '두산', img: '양의지', num: '06', position: '포수', extraBg: 'rgba(1,13,26,0.38)', logoClass: '', playerClass: '', stats: ['골든글러브 10회 수상', '포수 단일 포지션 역대 최다 수상 9회', 'KBO 역대 최고 포수로 평가'] },
  { id: '이종범', nameEn: 'Lee Jong-beom', team: 'KIA 타이거즈', teamColor: '#ff3344', logo: '기아', img: '이종범', num: '07', position: '유격수', extraBg: 'rgba(26,0,5,0.38)', logoClass: 'logo-top-kia', playerClass: 'player-up', stats: ['KBO 통산 510도루', '정규시즌 MVP · 한국시리즈 MVP 2회 · 골든글러브 6회', 'KBO 최초 트리플쓰리 달성', '일본 주니치 진출 · KIA 영구결번'] },
  { id: '최정', nameEn: 'Choi Jeong', team: 'SSG 랜더스', teamColor: '#ff2244', logo: '쓱', img: '최정', num: '08', position: '3루수', extraBg: 'rgba(26,2,5,0.38)', logoClass: '', playerClass: '', stats: ['KBO 통산 527홈런 역대 1위', '골든글러브 8회', 'KBO 최초 1만 타석 달성', '20년 연속 현역 활약'] },
  { id: '안현민', nameEn: 'Ahn Hyeon-min', team: 'KT 위즈', teamColor: '#dd1133', logo: '케이티', img: '안현민', num: '09', position: '외야수', extraBg: 'rgba(13,0,5,0.38)', logoClass: '', playerClass: '', stats: ['2025 신인왕 · 골든글러브 동시 수상', '타율 0.334, 22홈런, 80타점'] },
  { id: '박민우', nameEn: 'Park Min-woo', team: 'NC 다이노스', teamColor: '#5599ee', logo: '엔씨', img: '박민우', num: '10', position: '내야수', extraBg: 'rgba(1,10,26,0.38)', logoClass: '', playerClass: '', stats: ['골든글러브 1회', '13시즌 연속 10도루 달성', '리드오프 스페셜리스트'] },
]

const MLB_PLAYERS = [
  { id: '오타니', nameEn: 'Shohei Ohtani', team: 'Los Angeles Dodgers', teamColor: '#55aaff', logo: '다저스', img: '오타니', position: '투타겸업', extraBg: 'rgba(0,9,26,0.38)', logoClass: '', playerClass: '', stats: ['MLB 통산 225홈런 567타점', '통산 38승 ERA 3.01', 'AL MVP 2회', 'MLB 역대 유일무이한 투타겸업 슈퍼스타'] },
  { id: '이정후', nameEn: 'Lee Jung-hoo · OF', team: 'San Francisco Giants', teamColor: '#ff8844', logo: '샌프란시스코', img: '이정후', position: '외야수', extraBg: 'rgba(26,8,0,0.38)', logoClass: 'logo-top', playerClass: 'player-nudge-up', stats: ['KBO 통산 타율 0.340 역대 1위', 'KBO MVP 1회, 골든글러브 5회, 신인왕', 'SF 자이언츠 6년 계약 MLB 진출'] },
]

function PlayerCard({ player, type }) {
  const [flipped, setFlipped] = useState(false)
  const displayName = player.id === '오타니' ? '오타니 쇼헤이' : player.id

  return (
    <div className="dex-card-scene" onClick={() => setFlipped(v => !v)}>
      <div className={`dex-card-inner${flipped ? ' flipped' : ''}`}>

        <div className="dex-card-face dex-card-front">
          <div className="dex-front-bg" style={{ background: player.extraBg }} />
          <div className={`dex-front-logo${player.logoClass ? ' ' + player.logoClass : ''}`}>
            <img src={`/images/logos/${player.logo}.png`} alt={player.logo} />
          </div>
          <div className={`dex-front-player${player.playerClass ? ' ' + player.playerClass : ''}`}>
            <img src={`/images/players/${player.img}.png`} alt={player.id} />
          </div>
          <div className="dex-front-gradient" />
          <div className="dex-front-label">
            {type === 'kbo'
              ? player.num
              : <span className="dex-mlb-badge">MLB</span>
            }
          </div>
          <div className="dex-front-info">
            <div className="dex-front-name-ko">{displayName}</div>
            <div className="dex-front-name-en">{player.nameEn}</div>
            <div className="dex-front-team" style={{ color: player.teamColor }}>{player.team}</div>
          </div>
        </div>

        <div className="dex-card-face dex-card-back">
          <div className="dex-back-accent" />
          <div className="dex-back-body">
            <img className="dex-back-watermark" src={`/images/logos/${player.logo}.png`} alt="" />
            <div className="dex-back-name">{displayName}</div>
            <div className="dex-back-pos">{player.position} · {player.team}</div>
            <div className="dex-back-divider" />
            <ul className="dex-back-stats">
              {player.stats.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        </div>

      </div>
    </div>
  )
}

export default function PlayerDexPage() {
  const navigate = useNavigate()

  return (
    <div className="playerdex-page">
      <div className="playerdex-bg" />
      <Nav />

      <div className="dex-content-wrap">
        <div className="dex-top-bar">
          <button className="dex-back-btn" onClick={() => navigate('/home')}>← 홈으로 돌아가기</button>
        </div>

        <div className="dex-title-area">
          <h1>선수 도감</h1>
          <p>선수 카드를 클릭하면 해당 선수의 이력을 확인할 수 있습니다</p>
        </div>

        <div className="dex-section-label">KBO</div>
        <div className="dex-kbo-grid">
          {KBO_PLAYERS.map(p => <PlayerCard key={p.id} player={p} type="kbo" />)}
        </div>

        <div className="dex-section-label">MLB</div>
        <div className="dex-mlb-grid">
          {MLB_PLAYERS.map(p => <PlayerCard key={p.id} player={p} type="mlb" />)}
        </div>
      </div>

      <Footer />
    </div>
  )
}

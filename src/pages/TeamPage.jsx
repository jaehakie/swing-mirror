import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import './TeamPage.css'

const MEMBERS = [
  {
    nameKo: '구준모', nameEn: 'Joon-mo Koo', role: 'Data Engineer',
    desc: '레퍼런스 선수 DB 구축,\n스윙 분석 모델 개발',
    icon: (
      <svg viewBox="0 0 38 38" fill="none">
        <ellipse cx="19" cy="9" rx="12" ry="4" stroke="#e8b84b" strokeWidth="1.8"/>
        <path d="M7 9v7c0 2.2 5.4 4 12 4s12-1.8 12-4V9" stroke="#e8b84b" strokeWidth="1.8"/>
        <path d="M7 16v7c0 2.2 5.4 4 12 4s12-1.8 12-4v-7" stroke="#e8b84b" strokeWidth="1.8"/>
        <path d="M7 23v7c0 2.2 5.4 4 12 4s12-1.8 12-4v-7" stroke="#e8b84b" strokeWidth="1.8"/>
      </svg>
    ),
  },
  {
    nameKo: '김재학', nameEn: 'Jae-hak Kim', role: 'Backend Engineer',
    desc: '서버 아키텍처 설계,\n분석 파이프라인 연동 및 최적화',
    icon: (
      <svg viewBox="0 0 38 38" fill="none">
        <rect x="4" y="6" width="30" height="10" rx="2" stroke="#e8b84b" strokeWidth="1.8"/>
        <rect x="4" y="21" width="30" height="10" rx="2" stroke="#e8b84b" strokeWidth="1.8"/>
        <circle cx="30" cy="11" r="1.8" fill="#e8b84b"/>
        <circle cx="30" cy="26" r="1.8" fill="#e8b84b"/>
        <line x1="8" y1="11" x2="24" y2="11" stroke="#e8b84b" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="8" y1="26" x2="24" y2="26" stroke="#e8b84b" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="8" y1="14" x2="18" y2="14" stroke="#e8b84b" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
        <line x1="8" y1="29" x2="18" y2="29" stroke="#e8b84b" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
  },
  {
    nameKo: '남윤서', nameEn: 'Yoon-seo Nam', role: 'ML Engineer',
    desc: '스윙 기반 맞춤 운동 DB 구축,\n영상 동기화 알고리즘 개발',
    icon: (
      <svg viewBox="0 0 38 38" fill="none">
        <path d="M19 32C13 32 7.5 28 7.5 22C7.5 18.5 9 16.5 9.5 14.5C9.5 11 12 8 16 8C17 8 18 8.5 19 9C20 8.5 21 8 22 8C26 8 28.5 11 28.5 14.5C29 16.5 30.5 18.5 30.5 22C30.5 28 25 32 19 32Z" stroke="#e8b84b" strokeWidth="1.8" strokeLinejoin="round"/>
        <line x1="19" y1="9" x2="19" y2="32" stroke="#e8b84b" strokeWidth="1.4"/>
        <path d="M9.5 19.5C12 19.5 13.5 21 13.5 23" stroke="#e8b84b" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M28.5 19.5C26 19.5 24.5 21 24.5 23" stroke="#e8b84b" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M10 14.5C12 14.5 13.5 15.5 13.5 17.5" stroke="#e8b84b" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M28 14.5C26 14.5 24.5 15.5 24.5 17.5" stroke="#e8b84b" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    nameKo: '박규태', nameEn: 'Gyu-tae Park', role: 'Computer Vision Engineer',
    desc: '사용자 영상 임팩트 프레임\n선택 모델 개발',
    icon: (
      <svg viewBox="0 0 38 38" fill="none">
        <path d="M5 13 L5 5 L13 5" stroke="#e8b84b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M25 5 L33 5 L33 13" stroke="#e8b84b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M33 25 L33 33 L25 33" stroke="#e8b84b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13 33 L5 33 L5 25" stroke="#e8b84b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="13" y="13" width="12" height="12" rx="1.5" stroke="#e8b84b" strokeWidth="1.6"/>
      </svg>
    ),
  },
  {
    nameKo: '박준상', nameEn: 'Jun-sang Park', role: 'Frontend & ML Engineer',
    desc: '서비스 UI/UX 디자인 기획 및 구현,\n스윙 분석 모델 개발',
    icon: (
      <svg viewBox="0 0 38 38" fill="none">
        <rect x="3" y="4" width="32" height="22" rx="2.5" stroke="#e8b84b" strokeWidth="1.8"/>
        <line x1="3" y1="30" x2="35" y2="30" stroke="#e8b84b" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="14" y1="33" x2="24" y2="33" stroke="#e8b84b" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M14 12 L10 15.5 L14 19" stroke="#e8b84b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M24 12 L28 15.5 L24 19" stroke="#e8b84b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="18" y1="10" x2="20" y2="21" stroke="#e8b84b" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
]

function MemberCard({ member }) {
  return (
    <div className="member-card">
      <div className="card-name-ko">{member.nameKo}</div>
      <div className="card-name-en">{member.nameEn}</div>
      <div className="card-role-badge">{member.role}</div>
      <div className="card-divider" />
      <div className="card-desc-row">
        <div className="card-icon">{member.icon}</div>
        <div className="card-desc">{member.desc}</div>
      </div>
    </div>
  )
}

export default function TeamPage() {
  const navigate = useNavigate()

  return (
    <div className="team-page">
      <div className="team-bg" />
      <Nav />

      <div className="team-main">
        <button className="team-back-btn" onClick={() => navigate('/home')}>← 홈으로 돌아가기</button>

        <div className="team-title-area">
          <h1>개발진 소개</h1>
          <p>Swing Mirror를 만든 사람들</p>
        </div>

        <div className="team-cards-wrap">
          <div className="team-row-3">
            {MEMBERS.slice(0, 3).map(m => <MemberCard key={m.nameKo} member={m} />)}
          </div>
          <div className="team-row-2">
            {MEMBERS.slice(3).map(m => <MemberCard key={m.nameKo} member={m} />)}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

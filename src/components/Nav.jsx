import { useNavigate, useLocation } from 'react-router-dom'
import './Nav.css'

const NAV_LINKS = [
  { label: '홈', path: '/home' },
  { label: '분석', path: '/upload' },
  { label: '아카이브', path: '/archive' },
  { label: '선수 도감', path: '/playerdex' },
  { label: '캘린더', path: '/calendar' },
  { label: '개발진 소개', path: '/team' },
]

export default function Nav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav className="nav">
      <button className="nav-logo-btn" onClick={() => navigate('/home')}>
        <img className="nav-logo-img" src="/images/로고.png" alt="Swing Mirror" />
      </button>

      <ul className="nav-menu">
        {NAV_LINKS.map(({ label, path }) => (
          <li key={path}>
            <a
              href="#"
              className={pathname === path ? 'active' : ''}
              onClick={e => { e.preventDefault(); navigate(path) }}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>

      <div className="nav-profile">
        <div className="nav-avatar">
          <img src="/images/players/오타니.png" alt="profile" />
        </div>
        <div className="nav-profile-info">
          <span className="nav-profile-name">SwingMaster</span>
          <span className="nav-profile-email">swingmaster@email.com</span>
        </div>
        <span className="nav-profile-caret">▾</span>
      </div>
    </nav>
  )
}

import { useNavigate } from 'react-router-dom'
import './HomePage.css'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="home-page">
      <div className="home-bg" />

      {/* ── NAV ── */}
      <nav className="home-nav">
        <div className="home-logo">
          <img className="home-logo-img" src="/images/로고.png" alt="Swing Mirror" />
        </div>

        <ul className="home-nav-menu">
          <li><a href="#" className="active" onClick={e => e.preventDefault()}>홈</a></li>
          <li><a href="#" onClick={e => { e.preventDefault(); navigate('/upload') }}>분석</a></li>
          <li><a href="#" onClick={e => { e.preventDefault(); navigate('/archive') }}>아카이브</a></li>
          <li><a href="#" onClick={e => { e.preventDefault(); navigate('/playerdex') }}>선수 도감</a></li>
          <li><a href="#" onClick={e => { e.preventDefault(); navigate('/calendar') }}>캘린더</a></li>
          <li><a href="#" onClick={e => { e.preventDefault(); navigate('/team') }}>개발진 소개</a></li>
        </ul>

        <div className="home-nav-profile">
          <div className="home-profile-avatar">
            <img src="/images/players/오타니.png" alt="profile" />
          </div>
          <div>
            <div className="home-profile-name">SwingMaster</div>
            <div className="home-profile-email">swingmaster@email.com</div>
          </div>
          <span className="home-profile-caret">▾</span>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="home-hero">
        <div className="home-hero-left">
          <div className="home-quote-open">"</div>
          <h1 className="home-quote-text">
            누구에게나 재능은 있지만<br />그것을 갈고닦는 건 본인의 몫이다.
          </h1>
          <p className="home-quote-author">- 오타니 쇼헤이 -</p>
          <button className="home-cta-btn" onClick={() => navigate('/upload')}>
            분석 시작하기
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginLeft: '0.1vw' }}>
              <path d="M2 7 H12" stroke="rgba(0,0,0,0.65)" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M8 3.5 L12 7 L8 10.5" stroke="rgba(0,0,0,0.65)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <img className="home-hero-player" src="/images/오타니-홈화면.png" alt="오타니 쇼헤이" />
      </section>

      {/* ── 하단 카드 ── */}
      <div className="home-cards">

        {/* 01 스윙 아카이브 */}
        <div className="home-card" onClick={() => navigate('/archive')}>
          <div className="home-card-num">01</div>
          <div className="home-card-title">스윙 아카이브</div>
          <div className="home-card-desc">과거 분석 기록을<br />확인하고 관리하세요.</div>
          <svg className="home-card-icon" viewBox="0 0 76 76" fill="none">
            <rect x="10" y="22" width="50" height="36" rx="3" fill="#18263a" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <rect x="6"  y="17" width="50" height="36" rx="3" fill="#1f3048" stroke="rgba(255,255,255,0.1)"  strokeWidth="1" />
            <rect x="2"  y="12" width="52" height="38" rx="3" fill="#273d5a" stroke="rgba(255,255,255,0.13)" strokeWidth="1" />
            <circle cx="28" cy="31" r="9" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
            <polygon points="25,27.5 25,34.5 32,31" fill="rgba(255,255,255,0.55)" />
            <rect x="7"  y="42" width="42" height="2" rx="1" fill="rgba(255,255,255,0.07)" />
            <rect x="7"  y="46" width="32" height="2" rx="1" fill="rgba(255,255,255,0.05)" />
          </svg>
          <span className="home-card-arrow">›</span>
        </div>

        {/* 02 캘린더 */}
        <div className="home-card" onClick={() => navigate('/calendar')}>
          <div className="home-card-num">02</div>
          <div className="home-card-title">캘린더</div>
          <div className="home-card-desc">출석 및 방문 기록을<br />확인하고 보상을 받으세요.</div>
          <svg className="home-card-icon" viewBox="0 0 76 76" fill="none">
            <rect x="6" y="14" width="52" height="48" rx="5" fill="#1a3a6e" stroke="rgba(100,160,255,0.2)" strokeWidth="1.5" />
            <rect x="6" y="14" width="52" height="16" rx="5" fill="#2755a8" />
            <rect x="6" y="22" width="52" height="8" fill="#2755a8" />
            <rect x="18" y="8" width="4" height="12" rx="2" fill="#5090e0" />
            <rect x="42" y="8" width="4" height="12" rx="2" fill="#5090e0" />
            <rect x="14" y="36" width="7" height="7" rx="1.5" fill="#5090e0" opacity="0.85" />
            <rect x="25" y="36" width="7" height="7" rx="1.5" fill="#5090e0" opacity="0.85" />
            <rect x="36" y="36" width="7" height="7" rx="1.5" fill="#5090e0" opacity="0.85" />
            <rect x="47" y="36" width="7" height="7" rx="1.5" fill="#5090e0" opacity="0.85" />
            <rect x="14" y="47" width="7" height="7" rx="1.5" fill="#5090e0" opacity="0.65" />
            <rect x="25" y="47" width="7" height="7" rx="1.5" fill="#5090e0" opacity="0.65" />
            <rect x="36" y="47" width="7" height="7" rx="1.5" fill="#5090e0" opacity="0.65" />
            <path d="M15.5 40 L17.5 42 L21 38.5" stroke="rgba(255,255,255,0.85)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M26.5 40 L28.5 42 L32 38.5" stroke="rgba(255,255,255,0.85)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M37.5 40 L39.5 42 L43 38.5" stroke="rgba(255,255,255,0.85)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          <span className="home-card-arrow">›</span>
        </div>

        {/* 03 선수 도감 */}
        <div className="home-card" onClick={() => navigate('/playerdex')}>
          <div className="home-card-num">03</div>
          <div className="home-card-title">선수 도감</div>
          <div className="home-card-desc">레퍼런스 선수 12명의<br />스윙을 만나보세요.</div>
          <svg className="home-card-icon" viewBox="0 0 76 76" fill="none">
            <rect x="30" y="6"  width="36" height="50" rx="4" fill="#2a1e06" stroke="#7a5c14" strokeWidth="1.5" />
            <rect x="20" y="12" width="36" height="50" rx="4" fill="#3a2a0a" stroke="#9a7c20" strokeWidth="1.5" />
            <rect x="10" y="18" width="38" height="52" rx="4" fill="#e8b84b" stroke="#c89828" strokeWidth="1.5" />
            <rect x="10" y="18" width="38" height="18" rx="4" fill="#c89828" />
            <rect x="10" y="28" width="38" height="8"  fill="#c89828" />
            <circle cx="29" cy="35" r="7.5" fill="#e8b84b" stroke="#c89828" strokeWidth="1" />
            <circle cx="29" cy="32"   r="3"   fill="rgba(0,0,0,0.45)" />
            <path   d="M23 40 Q25.5 36.5 29 36.5 Q32.5 36.5 35 40 Z" fill="rgba(0,0,0,0.45)" />
            <text x="29" y="56" textAnchor="middle" fontSize="7.5" fontWeight="900" fill="#c89828" fontFamily="Arial,sans-serif">12</text>
            <text x="29" y="64" textAnchor="middle" fontSize="4.5" fontWeight="700" fill="#c89828" fontFamily="Arial,sans-serif" letterSpacing="0.8">PLAYERS</text>
            <polygon points="25,20 29,15.5 33,20" fill="#e8b84b" />
          </svg>
          <span className="home-card-arrow">›</span>
        </div>

        {/* 04 개발진 소개 */}
        <div className="home-card" onClick={() => navigate('/team')}>
          <div className="home-card-num">04</div>
          <div className="home-card-title">개발진 소개</div>
          <div className="home-card-desc">Swing Mirror를 만든<br />개발진을 소개합니다.</div>
          <svg className="home-card-icon" viewBox="0 0 76 76" fill="none">
            <rect x="48" y="10" width="5" height="38" rx="2.5" fill="#3a5ea0" transform="rotate(28 48 10)" />
            <rect x="20" y="10" width="5" height="38" rx="2.5" fill="#3a5ea0" transform="rotate(-28 20 10)" />
            <path d="M18 44 Q18 26 38 26 Q58 26 58 44 L58 52 Q58 57 53 57 L23 57 Q18 57 18 52 Z" fill="#2655a8" />
            <path d="M18 44 Q18 26 38 26 Q52 26 57 38 L18 45 Z" fill="#3566c0" opacity="0.45" />
            <path d="M12 50 Q12 55 17 55 L50 55 Q53 55 53 52 L53 50 Q53 47.5 50 47.5 L15 47.5 Q12 47.5 12 50 Z" fill="#1a48a0" />
            <text x="36" y="49" textAnchor="middle" fontSize="9" fontWeight="900" fill="rgba(255,255,255,0.75)" fontFamily="Arial,sans-serif">SM</text>
            <path d="M24 30 Q31 27.5 38 28.5" stroke="rgba(255,255,255,0.28)" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
          <span className="home-card-arrow">›</span>
        </div>

      </div>

      {/* ── FOOTER ── */}
      <footer className="home-footer">
        <span className="home-footer-copy">© 2024 Swing Mirror. All rights reserved.</span>
        <ul className="home-footer-links">
          <li><a href="#">이용약관</a></li>
          <li><a href="#">개인정보처리방침</a></li>
          <li><a href="#">문의하기</a></li>
        </ul>
        <div className="home-footer-sns">
          <a href="#" title="YouTube">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 00.5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 002.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 002.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.8 15.5V8.5l6.3 3.5-6.3 3.5z" /></svg>
          </a>
          <a href="#" title="Instagram">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8 0 3.2 0 3.6-.1 4.8-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1-3.2 0-3.6 0-4.8-.1-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.3 2.2 12c0-3.2 0-3.6.1-4.8C2.4 3.9 4 2.3 7.2 2.3c1.3-.1 1.6-.1 4.8-.1zM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1 0 8.3 0 8.7 0 12c0 3.3 0 3.7.1 4.9.2 4.4 2.6 6.8 7 7C8.3 24 8.7 24 12 24c3.3 0 3.7 0 4.9-.1 4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9 0-3.3 0-3.7-.1-4.9C23.7 2.7 21.3.3 16.9.1 15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 100 12.4A6.2 6.2 0 0012 5.8zM12 16a4 4 0 110-8 4 4 0 010 8zm6.4-11.8a1.4 1.4 0 100 2.8 1.4 1.4 0 000-2.8z" /></svg>
          </a>
          <a href="#" title="X">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.2 2h3.1l-6.8 7.8L22.5 22h-6.3l-4.9-6.4L5.5 22H2.4l7.3-8.3L2 2h6.4l4.4 5.8L18.2 2zm-1.1 17.9h1.7L7 3.7H5.2l11.9 16.2z" /></svg>
          </a>
        </div>
      </footer>

    </div>
  )
}

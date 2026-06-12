import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './SplashPage.css'

export default function SplashPage() {
  const navigate = useNavigate()
  const [dots, setDots] = useState('')

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.')
    }, 400)
    const redirect = setTimeout(() => navigate('/home'), 5100)
    return () => { clearInterval(dotsInterval); clearTimeout(redirect) }
  }, [navigate])

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', background: '#050810' }}>
      <img className="splash-bg" src="/images/splash-bg.png" alt="" />
      <div className="splash-loader">
        <div className="splash-track"><div className="splash-fill" /></div>
        <div className="splash-label">스윙을 분석하는 중<span>{dots}</span></div>
      </div>
    </div>
  )
}

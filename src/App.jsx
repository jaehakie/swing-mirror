import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SplashPage      from './pages/SplashPage'
import HomePage        from './pages/HomePage'
import UploadPage      from './pages/UploadPage'
import PlayerSelectPage from './pages/PlayerSelectPage'
import AnalyzingPage   from './pages/AnalyzingPage'
import ResultPage      from './pages/ResultPage'
import ArchivePage     from './pages/ArchivePage'
import CalendarPage    from './pages/CalendarPage'
import PlayerDexPage   from './pages/PlayerDexPage'
import TeamPage        from './pages/TeamPage'
import ExerciseRoute   from './pages/ExerciseRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Navigate to="/splash" replace />} />
        <Route path="/splash"    element={<SplashPage />} />
        <Route path="/home"      element={<HomePage />} />
        <Route path="/upload"    element={<UploadPage />} />
        <Route path="/select"    element={<PlayerSelectPage />} />
        <Route path="/analyzing" element={<AnalyzingPage />} />
        <Route path="/result"    element={<ResultPage />} />
        <Route path="/exercise"  element={<ExerciseRoute />} />
        <Route path="/archive"   element={<ArchivePage />} />
        <Route path="/calendar"  element={<CalendarPage />} />
        <Route path="/playerdex" element={<PlayerDexPage />} />
        <Route path="/team"      element={<TeamPage />} />
      </Routes>
    </BrowserRouter>
  )
}

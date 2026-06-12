import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ExercisePage from './ExercisePage'

const METRIC_LABELS = {
  lead_elbow_angle: 'Attack Angle',
  rear_elbow_angle: 'Bat Speed',
  lead_shoulder_angle: 'Swing Path Tilt',
  hip_angle: 'Intercept Point',
  feet_distance_ratio: 'Feet Distance',
}

const METRIC_ORDER = [
  'lead_elbow_angle',
  'rear_elbow_angle',
  'lead_shoulder_angle',
  'hip_angle',
  'feet_distance_ratio',
]

function colorClassForGap(gap) {
  if (gap >= 70) return 'fill-critical'
  if (gap >= 50) return 'fill-high'
  if (gap >= 30) return 'fill-mid'
  return 'fill-low'
}

function gapValue(item) {
  const diff = Math.abs(Number(item?.diff) || 0)
  const normalized = item?.unit === 'ratio' ? diff * 100 : diff
  return Math.max(0, Math.min(100, Math.round(normalized)))
}

function buildStatGaps(apiResult) {
  const comparison = apiResult?.comparison || {}
  const ids = METRIC_ORDER.filter(id => comparison[id])

  if (ids.length === 0) return undefined

  return ids.map(id => {
    const gap = gapValue(comparison[id])
    return {
      label: METRIC_LABELS[id] || comparison[id]?.savant || id,
      gap,
      colorClass: colorClassForGap(gap),
    }
  })
}

export default function ExerciseRoute() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState('gym')
  const apiResult = location.state || {}
  const statGaps = useMemo(() => buildStatGaps(apiResult), [apiResult])

  return (
    <ExercisePage
      mode={mode}
      onModeChange={setMode}
      onBack={() => navigate('/result', { state: apiResult })}
      statGaps={statGaps}
    />
  )
}

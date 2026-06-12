export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function analyzeSwing(videoFile, playerId, impactFrame = -1, userHanded = 'right') {
  const form = new FormData();
  form.append('video', videoFile);
  form.append('player_id', playerId);
  form.append('impact_frame', String(impactFrame));
  form.append('user_handed', userHanded);

  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Analysis request failed.');
  }

  return res.json();
}

export function pollResult(jobId, onDone, onError, onProgress) {
  let stopped = false;

  async function tick() {
    if (stopped) return;

    try {
      const res = await fetch(`${API_BASE}/api/result/${jobId}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Result polling failed.');
      }

      const data = await res.json();
      onProgress?.(data);

      if (data.status === 'done') {
        stopped = true;
        onDone(data);
        return;
      }

      if (data.status === 'error') {
        stopped = true;
        onError(data.error || 'Analysis failed.');
        return;
      }

      window.setTimeout(tick, 1500);
    } catch (error) {
      stopped = true;
      onError(error.message);
    }
  }

  tick();
  return () => {
    stopped = true;
  };
}

export async function detectImpact(videoFile) {
  const form = new FormData();
  form.append('video', videoFile);

  const res = await fetch(`${API_BASE}/api/detect-impact`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Impact detection failed.');
  }

  return res.json();
}

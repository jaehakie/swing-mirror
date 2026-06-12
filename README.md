# Swing Mirror

Swing Mirror is a baseball swing analysis prototype. The React frontend lets a
user upload a swing video, choose a reference hitter, watch analysis progress,
and review metric feedback. The FastAPI backend extracts pose keypoints,
compares them with reference-player data, and optionally generates AI feedback.

## Project Structure

```text
swing-mirror/
  src/                  React frontend
  public/images/         Static UI assets
  backend/               FastAPI analysis server
    main.py              API entry point
    analyzer.py          Pose analysis and feedback logic
    routers/             API routes
    reference_db/        Reference keypoints and player videos
    requirements.txt     Python dependencies
```

Generated folders such as `node_modules/`, `dist/`, `backend/venv/`,
`backend/dist/`, and upload results are intentionally excluded from git.

## Frontend

```bash
npm install
npm run dev
```

The frontend uses `VITE_API_URL` when provided. If it is not set, it calls
`http://localhost:8000`.

```bash
VITE_API_URL=http://localhost:8000 npm run dev
```

## Backend

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
python -m pip install -r requirements.txt
copy .env.example .env
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Set `ANTHROPIC_API_KEY` in `backend/.env` to enable detailed AI feedback.
Without the key, core pose comparison can still run, but AI report generation
will be skipped or return an API-key error depending on the path.

## Production Build

Build the frontend:

```bash
npm run build
```

If you want the FastAPI server to serve the built React app, copy the generated
`dist/` folder into `backend/dist/`.

## Git Setup

This cleaned folder is ready to initialize as a repository:

```bash
git init
git add .
git commit -m "Initial Swing Mirror cleanup"
```

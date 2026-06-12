"""
SwingMirror FastAPI backend
===========================

Roles:
  1. Serve the built React files in backend/dist.
  2. Provide swing analysis APIs under /api/*.

Run:
  uvicorn main:app --reload --host 0.0.0.0 --port 8000
"""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from routers import analyze


app = FastAPI(
    title="SwingMirror API",
    description="AI 야구 스윙 교정 분석 서버",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/api", tags=["분석"])

DIST_DIR = os.path.join(os.path.dirname(__file__), "dist")

if os.path.exists(DIST_DIR):
    app.mount(
        "/assets",
        StaticFiles(directory=os.path.join(DIST_DIR, "assets")),
        name="assets",
    )
    app.mount(
        "/images",
        StaticFiles(directory=os.path.join(DIST_DIR, "images")),
        name="images",
    )

    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_react(full_path: str):
        index = os.path.join(DIST_DIR, "index.html")
        return FileResponse(index, media_type="text/html; charset=utf-8")
else:

    @app.get("/", include_in_schema=False)
    def root():
        return {
            "message": "SwingMirror API 서버 실행 중",
            "note": "dist/ 폴더가 없습니다. React 빌드를 backend/dist로 복사해주세요.",
            "api_docs": "/docs",
        }

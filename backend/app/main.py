from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import regions

app = FastAPI(title="OTA Worldmap API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(regions.router)


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

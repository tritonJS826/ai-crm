from fastapi import APIRouter, HTTPException
from app.db import db

router = APIRouter()


@router.get("/")
async def root():
    try:
        users_count = await db.user.count()
        return {"status": "ok", "users": users_count}
    except Exception as e:
        # 👇 this block is what your test needs to execute
        raise HTTPException(status_code=500, detail=f"Health check failed: {e}")


@router.get("/general")
async def general():
    users_count = await db.user.count()
    return {
        "status": "Backend with Prisma and FastAPI - working! (/general)",
        "users_in_db": users_count,
    }

from app.api import api_router
from fastapi.middleware.cors import CORSMiddleware

from app.settings import settings

from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.db import db
from app.logging import logger

from prisma.engine.errors import AlreadyConnectedError


@asynccontextmanager
async def lifespan(app: FastAPI):
    connected_by_app = False

    try:
        try:
            await db.connect()
            connected_by_app = True
            logger.info("DB CONNECTED AND QUERYABLE")
        except AlreadyConnectedError:
            # This happens in tests when another TestClient/transport already started the app.
            logger.info("DB already connected, skipping connect()")

        yield

    finally:
        # Only disconnect if THIS lifespan instance did the connect.
        if connected_by_app:
            try:
                await db.disconnect()
                logger.info("DB disconnected")
            except Exception:
                logger.exception("DB disconnect failed")


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.webapp_domain],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "x-refresh-token",  # custom header now allowed
        "X-Requested-With",
    ],
)

app.include_router(api_router)

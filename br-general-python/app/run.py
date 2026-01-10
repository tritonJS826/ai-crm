import uvicorn
from app.settings import settings
from app.logging import logger

from app.main import app  # noqa: F401

if __name__ == "__main__":
    port = settings.server_port

    logger.info(
        "Starting server",
        extra={
            "port": port,
            "reload": settings.flag_reload,
        },
    )

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=settings.flag_reload,
        log_level="info",
        access_log=True,
    )

import logging
import sys

from app.settings import settings


def setup_logger() -> logging.Logger:
    logger = logging.getLogger("br-general")

    if logger.handlers:
        return logger  # prevent double handlers on reload

    logger.setLevel(logging.INFO)

    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter(
        "[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s"
    )
    handler.setFormatter(formatter)

    logger.addHandler(handler)

    # Allow propagation in tests so pytest caplog can see logs
    logger.propagate = settings.env_type != "production"

    return logger


logger = setup_logger()

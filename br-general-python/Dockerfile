# -------- Stage 1: Builder --------
FROM python:3.13-slim AS builder

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PYTHONPATH=/app \
    PRISMA_CACHE_DIR=/app/.prisma

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    tzdata \
    ca-certificates \
    curl \
    nodejs npm \
    && rm -rf /var/lib/apt/lists/*

COPY br-general-python/requirements.txt requirements.txt
COPY br-general-python/requirements/ requirements/

RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements/production.txt

COPY br-general-python .

# Generate Prisma client(s)
# RUN prisma py fetch
RUN prisma generate --schema=prisma/schema.prisma


# -------- Stage 2: Runtime --------
FROM python:3.13-slim AS runtime

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    TZ=Europe/Berlin \
    PYTHONPATH=/app \
    PRISMA_CACHE_DIR=/app/.prisma

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    tzdata \
    ca-certificates \
    libatomic1 \
    && rm -rf /var/lib/apt/lists/*

# Copy python deps + binaries
COPY --from=builder /usr/local/lib/python3.13 /usr/local/lib/python3.13
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy app code
COPY --from=builder /app /app

# Copy Prisma Python binaries (needed at runtime!)
COPY --from=builder /root/.cache/prisma-python /root/.cache/prisma-python

VOLUME /app/logs
EXPOSE 8000
CMD ["python", "-m", "app.run"]

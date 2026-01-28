"""
API router configuration.

Registers all API endpoints with appropriate prefixes and tags.
"""

from fastapi import APIRouter

from . import (
    auth,
    health,
    users,
    conversations,
    products,
    webhooks,
    checkout,
    ai,
    websocket,
    ready,
    check,
)
from ..settings import settings

api_router = APIRouter()

# Health check
api_router.include_router(health.router, prefix="/health", tags=["health"])

# Authentication
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

# Users
api_router.include_router(users.router, prefix="/users", tags=["users"])

# Conversations and Messages
api_router.include_router(
    conversations.router, prefix="/conversations", tags=["conversations"]
)

# Products Catalog
api_router.include_router(products.router, prefix="/products", tags=["products"])

# Checkout (Stripe redirect)
api_router.include_router(checkout.router, prefix="/stripe", tags=["stripe"])

# Webhooks (Meta + Stripe)
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])

# AI Drafting
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])

# Email (only in dev mode)
if settings.env_type != "prod":
    from . import email

    api_router.include_router(email.router, prefix="/email", tags=["email"])

# WebSocket
api_router.include_router(websocket.router, prefix="/ws", tags=["websocket"])

api_router.include_router(check.router, prefix="/check", tags=["check"])

api_router.include_router(ready.router, prefix="", tags=["ready"])

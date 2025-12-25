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
)
from ..settings import settings

api_router = APIRouter()

# Health check
api_router.include_router(
    health.router,
    prefix="/br-general/health",
    tags=["health"],
)

# Authentication
api_router.include_router(
    auth.router,
    prefix="/br-general/auth",
    tags=["auth"],
)

# Users
api_router.include_router(
    users.router,
    prefix="/br-general/users",
    tags=["users"],
)

# Conversations and Messages
api_router.include_router(
    conversations.router,
    prefix="/br-general/conversations",
    tags=["conversations"],
)

# Products Catalog
api_router.include_router(
    products.router,
    prefix="/br-general/products",
    tags=["products"],
)

# Checkout (Stripe redirect)
api_router.include_router(
    checkout.router,
    prefix="/br-general",
    tags=["checkout"],
)

# Webhooks (Meta + Stripe)
api_router.include_router(
    webhooks.router,
    prefix="/br-general/webhooks",
    tags=["webhooks"],
)

# AI Drafting
api_router.include_router(
    ai.router,
    prefix="/br-general/ai",
    tags=["ai"],
)

# Email (only in dev mode)
if settings.env_type != "prod":
    from . import email

    api_router.include_router(
        email.router,
        prefix="/br-general/email",
        tags=["email"],
    )

# WebSocket
api_router.include_router(
    websocket.router,
    prefix="/br-general/ws",
    tags=["websocket"],
)

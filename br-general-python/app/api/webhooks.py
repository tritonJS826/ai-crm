"""
API endpoints for Meta and Stripe webhooks.
"""

import logging

from fastapi import APIRouter, Request, HTTPException, Query, Response

from app.db import db
from app.settings import settings
from app.services.meta_service import meta_service
from app.services.stripe_service import stripe_service
from app.services.message_service import message_service
from app.repositories.order_repository import order_repo
from app.repositories.product_repository import product_repo
from app.repositories.conversation_repository import conversation_repo
from app.schemas.order import OrderStatus
from app.ws.dispatcher import emit
from app.ws.event_types import WSEventType

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/meta")
async def verify_meta_webhook(
    mode: str = Query(..., alias="hub.mode"),
    token: str = Query(..., alias="hub.verify_token"),
    challenge: str = Query(..., alias="hub.challenge"),
) -> Response:
    """
    Handle Meta webhook verification challenge.

    Meta sends a GET request with hub.mode, hub.verify_token, and hub.challenge.
    We must return the challenge if the token matches.
    """
    if not settings.meta_verify_token:
        logger.error("META_VERIFY_TOKEN not configured")
        raise HTTPException(status_code=500, detail="Webhook not configured")

    if mode == "subscribe" and token == settings.meta_verify_token:
        logger.info("Meta webhook verified successfully")
        return Response(content=challenge, media_type="text/plain")

    logger.warning(f"Meta webhook verification failed: mode={mode}")
    raise HTTPException(status_code=403, detail="Verification failed")


@router.post("/meta")
async def handle_meta_webhook(request: Request) -> dict:
    """
    Handle incoming Meta webhook events.

    Processes messages from WhatsApp, Messenger, and Instagram.
    """
    if not meta_service.is_configured:
        logger.warning("Meta webhook received but service not configured")
        return {"status": "ok", "message": "Service not configured"}

    body = await request.body()
    signature = request.headers.get("X-Hub-Signature-256", "")

    if not meta_service.verify_webhook_signature(body, signature):
        logger.warning("Invalid Meta webhook signature")
        raise HTTPException(status_code=401, detail="Invalid signature")

    try:
        payload = await request.json()
    except Exception as e:
        logger.error(f"Failed to parse Meta webhook payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid JSON")

    normalized = meta_service.normalize_webhook(payload)

    if normalized is not None:
        try:
            await message_service.handle_inbound_message(
                platform=normalized.platform,
                platform_user_id=normalized.platform_user_id,
                text=normalized.text,
                media_url=normalized.media_url,
                remote_message_id=normalized.remote_message_id,
                contact_name=normalized.contact_name,
                contact_phone=normalized.contact_phone,
            )
            logger.info(
                "Inbound %s message from %s",
                normalized.platform,
                normalized.platform_user_id,
            )
        except Exception:
            logger.exception("Error processing inbound message")

    return {"status": "ok"}


@router.post("/stripe")
async def handle_stripe_webhook(request: Request) -> dict:
    """
    Handle Stripe webhook events.

    Processes checkout.session.completed events to create orders
    and send confirmation messages.
    """
    if not stripe_service.is_configured:
        logger.warning("Stripe webhook received but service not configured")
        return {"status": "ok", "message": "Service not configured"}

    body = await request.body()
    signature = request.headers.get("Stripe-Signature", "")

    event = stripe_service.verify_webhook_signature(body, signature)

    if event is None:
        logger.warning("Invalid Stripe webhook signature")
        raise HTTPException(status_code=401, detail="Invalid signature")

    event_type = event.get("type")
    logger.info(f"Received Stripe event: {event_type}")

    if event_type == "checkout.session.completed":
        session_data = event.get("data", {}).get("object", {})

        if session_data:
            try:
                await _handle_checkout_completed(session_data)
            except Exception:
                logger.exception("Error handling checkout.session.completed")

    return {"status": "ok"}


async def _handle_checkout_completed(session: dict) -> None:
    """Process a completed checkout session."""
    session_id = session.get("id")
    if not session_id:
        logger.error("Checkout session missing ID")
        return

    metadata = session.get("metadata") or {}
    payment_status = session.get("payment_status")

    if payment_status != "paid":
        logger.info(
            f"Session {session_id} not paid (status: {payment_status}), skipping"
        )
        return

    product_id = metadata.get("product_id")
    conversation_id = metadata.get("conversation_id")
    contact_id = metadata.get("contact_id")

    if not product_id:
        logger.error(f"No product_id in session {session_id} metadata")
        return

    product = await product_repo.get_by_id(db, product_id)
    if product is None:
        logger.error(f"Product {product_id} not found")
        return

    existing = await order_repo.get_by_stripe_session(db, session_id)
    if existing is not None:
        logger.info(f"Order for session {session_id} already exists")
        return

    if not contact_id and conversation_id:
        conversation = await conversation_repo.get_by_id(db, conversation_id)
        if conversation is not None:
            contact_id = conversation.contactId

    if not contact_id:
        logger.error(f"Cannot create order: no contact_id for session {session_id}")
        return

    order = await order_repo.create(
        db,
        contact_id=contact_id,
        product_id=product_id,
        amount_cents=product.priceCents,
        currency=product.currency,
        stripe_session_id=session_id,
        conversation_id=conversation_id,
    )

    order = await order_repo.update_status(db, order.id, OrderStatus.PAID)

    logger.info(f"Created order {order.id} for session {session_id}")

    await emit(
        WSEventType.ORDER_CREATED,
        {
            "order_id": order.id,
            "product_title": product.title,
            "amount_cents": product.priceCents,
            "currency": product.currency,
        },
    )

    if conversation_id:
        amount_str = f"{product.priceCents / 100:.2f} {product.currency}"
        await message_service.send_order_confirmation(
            conversation_id=conversation_id,
            order_id=order.id,
            product_title=product.title,
            amount=amount_str,
        )

"""
Service for Stripe payment operations.
"""

import asyncio
import logging
from concurrent.futures import ThreadPoolExecutor
from functools import partial
from typing import Optional

import stripe

from app.settings import settings

logger = logging.getLogger(__name__)

# Stripe SDK is synchronous → run in a small shared thread pool
_STRIPE_EXECUTOR = ThreadPoolExecutor(max_workers=3)


class StripeService:
    """Service for Stripe Checkout Sessions."""

    def __init__(self) -> None:
        self._initialized = False

    def _ensure_initialized(self) -> None:
        if self._initialized:
            return

        if not settings.stripe_secret_key:
            logger.warning("Stripe not configured: STRIPE_SECRET_KEY not set")
            return

        stripe.api_key = settings.stripe_secret_key
        self._initialized = True

    @property
    def is_configured(self) -> bool:
        return settings.is_stripe_configured and bool(settings.stripe_secret_key)

    # -------------------------
    # Webhook verification
    # -------------------------

    def verify_webhook_signature(
        self,
        payload: bytes,
        signature: str,
    ) -> Optional[dict]:
        if not self.is_configured:
            logger.error("Stripe not configured for webhook verification")
            return None

        try:
            return stripe.Webhook.construct_event(
                payload,
                signature,
                settings.stripe_webhook_secret,
            )
        except stripe.error.SignatureVerificationError:
            logger.warning("Stripe signature verification failed")
            return None
        except Exception:
            logger.exception("Unexpected Stripe webhook verification error")
            return None

    # -------------------------
    # Checkout
    # -------------------------

    async def create_checkout_session(
        self,
        *,
        stripe_price_id: str,
        product_id: str,
        conversation_id: Optional[str] = None,
        contact_id: Optional[str] = None,
    ) -> Optional[str]:
        if not self.is_configured:
            logger.error("Stripe not configured for checkout")
            return None

        self._ensure_initialized()

        metadata = {"product_id": product_id}
        if conversation_id:
            metadata["conversation_id"] = conversation_id
        if contact_id:
            metadata["contact_id"] = contact_id

        try:
            loop = asyncio.get_running_loop()
            session = await loop.run_in_executor(
                _STRIPE_EXECUTOR,
                partial(
                    stripe.checkout.Session.create,
                    mode="payment",
                    line_items=[{"price": stripe_price_id, "quantity": 1}],
                    success_url=(
                        f"{settings.app_base_url}"
                        "/payment/success?session_id={CHECKOUT_SESSION_ID}"
                    ),
                    cancel_url=f"{settings.app_base_url}/payment/cancel",
                    client_reference_id=conversation_id,
                    metadata=metadata,
                ),
            )
            return session.url

        except stripe.error.StripeError as exc:
            logger.error("Stripe Checkout error: %s", exc)
            return None

    async def get_session(self, session_id: str) -> Optional[dict]:
        if not self.is_configured:
            return None

        self._ensure_initialized()

        try:
            loop = asyncio.get_running_loop()
            return await loop.run_in_executor(
                _STRIPE_EXECUTOR,
                partial(stripe.checkout.Session.retrieve, session_id),
            )
        except stripe.error.StripeError as exc:
            logger.error("Stripe session retrieval error: %s", exc)
            return None


stripe_service = StripeService()

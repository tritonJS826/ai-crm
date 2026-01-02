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

_executor = ThreadPoolExecutor(max_workers=3)


class StripeService:
    """Service for Stripe Checkout Sessions."""

    def __init__(self) -> None:
        self._initialized = False
        self._init_stripe()

    def _init_stripe(self) -> None:
        """Initialize Stripe with API key if configured."""
        if settings.stripe_secret_key:
            stripe.api_key = settings.stripe_secret_key
            self._initialized = True
        else:
            logger.warning("Stripe not configured: STRIPE_SECRET_KEY not set")

    @property
    def is_configured(self) -> bool:
        """Check if Stripe is properly configured."""
        return self._initialized and settings.is_stripe_configured

    def verify_webhook_signature(
        self,
        payload: bytes,
        signature: str,
    ) -> Optional[dict]:
        """
        Verify Stripe webhook signature and return event data.

        Returns None if verification fails.
        """
        if not self.is_configured:
            logger.error("Stripe not configured for webhook verification")
            return None

        try:
            event = stripe.Webhook.construct_event(
                payload,
                signature,
                settings.stripe_webhook_secret,
            )
            return event
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Stripe signature verification failed: {e}")
            return None
        except Exception as e:
            logger.error(f"Stripe webhook error: {e}")
            return None

    async def create_checkout_session(
        self,
        stripe_price_id: str,
        product_id: str,
        conversation_id: Optional[str] = None,
        contact_id: Optional[str] = None,
    ) -> Optional[str]:
        """
        Create a Stripe Checkout Session.

        Returns the checkout URL on success, None on failure.
        """
        if not self.is_configured:
            logger.error("Stripe not configured for checkout")
            return None

        try:
            metadata = {"product_id": product_id}
            if conversation_id:
                metadata["conversation_id"] = conversation_id
            if contact_id:
                metadata["contact_id"] = contact_id

            loop = asyncio.get_event_loop()
            session = await loop.run_in_executor(
                _executor,
                partial(
                    stripe.checkout.Session.create,
                    mode="payment",
                    line_items=[{"price": stripe_price_id, "quantity": 1}],
                    success_url=f"{settings.app_base_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
                    cancel_url=f"{settings.app_base_url}/payment/cancel",
                    client_reference_id=conversation_id,
                    metadata=metadata,
                ),
            )

            return session.url

        except stripe.error.StripeError as e:
            logger.error(f"Stripe Checkout error: {e}")
            return None

    async def get_session(self, session_id: str) -> Optional[dict]:
        """Retrieve a Checkout Session by ID."""
        if not self.is_configured:
            return None

        try:
            loop = asyncio.get_event_loop()
            session = await loop.run_in_executor(
                _executor,
                partial(stripe.checkout.Session.retrieve, session_id),
            )
            return session
        except stripe.error.StripeError as e:
            logger.error(f"Stripe session retrieval error: {e}")
            return None


stripe_service = StripeService()

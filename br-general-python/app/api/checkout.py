"""
API endpoint for Stripe Checkout redirect.
"""

from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import RedirectResponse

from app.db import db
from app.repositories.product_repository import product_repo
from app.services.stripe_service import stripe_service

router = APIRouter()


@router.get("/checkout")
async def create_checkout(
    product_id: str = Query(...),
    conv_id: Optional[str] = Query(None),
    contact_id: Optional[str] = Query(None),
):
    """
    Create a Stripe Checkout Session and redirect to payment page.

    This endpoint is intentionally PUBLIC.
    Security is enforced via Stripe webhooks, not here.
    """
    product = await product_repo.get_by_id(db, product_id)

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if not product.isActive:
        raise HTTPException(status_code=400, detail="Product is not available")

    if not product.stripePriceId:
        raise HTTPException(
            status_code=400,
            detail="Product is not configured for checkout",
        )

    checkout_url = await stripe_service.create_checkout_session(
        stripe_price_id=product.stripePriceId,
        product_id=product_id,
        conversation_id=conv_id,
        contact_id=contact_id,
    )

    if not checkout_url:
        raise HTTPException(
            status_code=500,
            detail="Failed to create checkout session",
        )

    return RedirectResponse(url=checkout_url, status_code=302)

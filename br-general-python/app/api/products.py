"""
API endpoints for product catalog management.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.users import get_current_user
from app.db import db
from app.repositories.product_repository import product_repo
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductOut,
    ProductListResponse,
)
from app.schemas.user import Role

router = APIRouter()


def require_admin(current_user=Depends(get_current_user)):
    """Require ADMIN role."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user


# -------------------------------------------------------------------
# Public / authenticated endpoints
# -------------------------------------------------------------------


@router.get("", response_model=ProductListResponse)
async def list_products(
    active_only: bool = True,
    search: Optional[str] = None,
    current_user=Depends(get_current_user),
):
    """List products."""
    products, total = await product_repo.list_products(
        db,
        active_only=active_only,
        search=search,
    )

    return ProductListResponse(
        items=[ProductOut.from_orm(p) for p in products],
        total=total,
    )


@router.get("/{product_id}", response_model=ProductOut)
async def get_product(
    product_id: str,
    current_user=Depends(get_current_user),
):
    """Get a specific product."""
    product = await product_repo.get_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return ProductOut.from_orm(product)


# -------------------------------------------------------------------
# Admin-only endpoints
# -------------------------------------------------------------------


@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
async def create_product(
    payload: ProductCreate,
    _admin=Depends(require_admin),
):
    """Create a new product (ADMIN only)."""
    product = await product_repo.create(
        db,
        title=payload.title,
        price_cents=payload.price_cents,
        stripe_price_id=payload.stripe_price_id,
        currency=payload.currency,
        image_url=payload.image_url,
        description=payload.description,
    )

    return ProductOut.from_orm(product)


@router.put("/{product_id}", response_model=ProductOut)
async def update_product(
    product_id: str,
    payload: ProductUpdate,
    _admin=Depends(require_admin),
):
    """Update a product (ADMIN only)."""
    existing = await product_repo.get_by_id(db, product_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")

    updated = await product_repo.update(
        db,
        product_id=product_id,
        data=payload.model_dump(exclude_unset=True),
    )

    return ProductOut.from_orm(updated)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: str,
    _admin=Depends(require_admin),
):
    """Soft delete a product (ADMIN only)."""
    existing = await product_repo.get_by_id(db, product_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")

    await product_repo.delete(db, product_id)

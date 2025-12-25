"""
Repository for Product database operations.
"""

from typing import Optional

from prisma import Prisma


class ProductRepository:
    """Repository for Product CRUD operations."""

    async def get_by_id(self, db: Prisma, product_id: str):
        """Get product by ID."""
        return await db.product.find_unique(where={"id": product_id})

    async def list_products(
        self,
        db: Prisma,
        active_only: bool = True,
        search: Optional[str] = None,
    ):
        """List all products with optional filtering."""
        where = {}

        if active_only:
            where["isActive"] = True

        if search:
            where["title"] = {"contains": search, "mode": "insensitive"}

        products = await db.product.find_many(
            where=where,
            order={"createdAt": "desc"},
        )

        total = await db.product.count(where=where)

        return products, total

    async def create(
        self,
        db: Prisma,
        title: str,
        price_cents: int,
        stripe_price_id: str,
        currency: str = "USD",
        image_url: Optional[str] = None,
        description: Optional[str] = None,
    ):
        """Create a new product."""
        return await db.product.create(
            data={
                "title": title,
                "priceCents": price_cents,
                "currency": currency,
                "imageUrl": image_url,
                "description": description,
                "stripePriceId": stripe_price_id,
            }
        )

    async def update(self, db: Prisma, product_id: str, data: dict):
        """Update a product."""
        # Convert snake_case to camelCase for Prisma
        prisma_data = {}
        field_mapping = {
            "title": "title",
            "price_cents": "priceCents",
            "currency": "currency",
            "image_url": "imageUrl",
            "description": "description",
            "stripe_price_id": "stripePriceId",
            "is_active": "isActive",
        }

        for key, value in data.items():
            if value is not None and key in field_mapping:
                prisma_data[field_mapping[key]] = value

        if not prisma_data:
            return await self.get_by_id(db, product_id)

        return await db.product.update(
            where={"id": product_id},
            data=prisma_data,
        )

    async def delete(self, db: Prisma, product_id: str):
        """Soft delete a product (set isActive=False)."""
        return await db.product.update(
            where={"id": product_id},
            data={"isActive": False},
        )


product_repo = ProductRepository()

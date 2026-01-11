"""
Repository for Order database operations.
"""

from typing import Optional

from prisma import Prisma

from app.schemas.order import OrderStatus


class OrderRepository:
    """Repository for Order CRUD operations."""

    async def get_by_id(self, db: Prisma, order_id: str):
        """Get order by ID with relations."""
        return await db.order.find_unique(
            where={"id": order_id},
            include={"contact": True, "product": True},
        )

    async def get_by_stripe_session(self, db: Prisma, stripe_session_id: str):
        """Get order by Stripe session ID."""
        return await db.order.find_unique(
            where={"stripeSessionId": stripe_session_id},
            include={"contact": True, "product": True},
        )

    async def create(
        self,
        db: Prisma,
        contact_id: str,
        product_id: str,
        amount_cents: int,
        currency: str,
        stripe_session_id: str,
        conversation_id: Optional[str] = None,
    ):
        """Create a new order."""
        return await db.order.create(
            data={
                "contactId": contact_id,
                "productId": product_id,
                "conversationId": conversation_id,
                "amountCents": amount_cents,
                "currency": currency,
                "stripeSessionId": stripe_session_id,
                "status": OrderStatus.PENDING.value,
            }
        )

    async def update_status(
        self,
        db: Prisma,
        order_id: str,
        status: OrderStatus,
    ):
        """Update order status."""
        return await db.order.update(
            where={"id": order_id},
            data={"status": status.value},
            include={"contact": True, "product": True},
        )

    async def list_by_contact(self, db: Prisma, contact_id: str):
        """List orders for a contact."""
        return await db.order.find_many(
            where={"contactId": contact_id},
            include={"product": True},
            order={"createdAt": "desc"},
        )


order_repo = OrderRepository()

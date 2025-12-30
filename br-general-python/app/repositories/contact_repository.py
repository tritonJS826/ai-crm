"""
Repository for Contact database operations.
"""

from typing import Optional

from prisma import Prisma
from prisma.models import Contact

from app.schemas.contact import Platform


class ContactRepository:
    """Repository for Contact CRUD operations."""

    async def get_by_id(self, db: Prisma, contact_id: str) -> Optional[Contact]:
        """Get contact by ID."""
        return await db.contact.find_unique(where={"id": contact_id})

    async def get_by_platform_user(
        self,
        db: Prisma,
        platform: Platform,
        platform_user_id: str,
    ) -> Optional[Contact]:
        """Get contact by platform and platform user ID."""
        return await db.contact.find_unique(
            where={
                "platform_platformUserId": {
                    "platform": platform.value,
                    "platformUserId": platform_user_id,
                }
            }
        )

    async def create(
        self,
        db: Prisma,
        platform: Platform,
        platform_user_id: str,
        phone: Optional[str] = None,
        name: Optional[str] = None,
    ) -> Contact:
        """Create a new contact."""
        return await db.contact.create(
            data={
                "platform": platform.value,
                "platformUserId": platform_user_id,
                "phone": phone,
                "name": name,
            }
        )

    async def upsert(
        self,
        db: Prisma,
        platform: Platform,
        platform_user_id: str,
        phone: Optional[str] = None,
        name: Optional[str] = None,
    ) -> Contact:
        """Create or update contact. Only updates fields that are not None."""
        update_data: dict = {}
        if phone is not None:
            update_data["phone"] = phone
        if name is not None:
            update_data["name"] = name

        return await db.contact.upsert(
            where={
                "platform_platformUserId": {
                    "platform": platform.value,
                    "platformUserId": platform_user_id,
                }
            },
            data={
                "create": {
                    "platform": platform.value,
                    "platformUserId": platform_user_id,
                    "phone": phone,
                    "name": name,
                },
                "update": update_data if update_data else {},
            },
        )

    async def update_opt_out(
        self,
        db: Prisma,
        contact_id: str,
        opt_out: bool,
    ) -> Contact:
        """Update contact opt-out status."""
        return await db.contact.update(
            where={"id": contact_id},
            data={"optOut": opt_out},
        )


contact_repo = ContactRepository()

"""
Repository for User database operations.
"""

from typing import Optional, List

from prisma import Prisma
from prisma.models import User

from app.schemas.user import Role


class UserRepository:
    """Repository for User CRUD operations."""

    async def get_by_id(self, db: Prisma, user_id: str) -> Optional[User]:
        """Get user by ID."""
        return await db.user.find_unique(where={"id": user_id})

    async def get_by_email(self, db: Prisma, email: str) -> Optional[User]:
        """Get user by email address."""
        return await db.user.find_unique(where={"email": email})

    async def create(
        self,
        db: Prisma,
        email: str,
        hashed_password: str,
        name: str,
        role: Role = Role.AGENT,
    ) -> User:
        """Create a new user."""
        return await db.user.create(
            data={
                "email": email,
                "hashed_password": hashed_password,
                "name": name,
                "role": role.value,
            }
        )

    async def list_users(
        self, db: Prisma, limit: int = 100, offset: int = 0
    ) -> List[User]:
        """
        List users with pagination.
        Defaults act as a safety guard to prevent unbounded queries.
        """
        return await db.user.find_many(
            order={"createdAt": "desc"},
            take=limit,
            skip=offset,
        )

    async def get_admin(self, db: Prisma) -> User | None:
        return await db.user.find_first(
            where={"role": Role.ADMIN.value},
            order={"createdAt": "asc"},
        )

    async def list_agents(self, db: Prisma) -> list[User]:
        return await db.user.find_many(
            where={"role": Role.AGENT.value},
            order={"createdAt": "asc"},
        )

    async def list_admins(self, db: Prisma):
        return await db.user.find_many(
            where={"role": Role.ADMIN.value},
            order={"createdAt": "asc"},
        )


user_repo = UserRepository()

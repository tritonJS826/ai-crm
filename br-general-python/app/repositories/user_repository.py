"""
Repository for User database operations.
"""

from prisma import Prisma

from app.schemas.user import Role


class UserRepository:
    """Repository for User CRUD operations."""

    async def get_by_id(self, db: Prisma, user_id: str):
        """Get user by ID."""
        return await db.user.find_unique(where={"id": user_id})

    async def get_by_email(self, db: Prisma, email: str):
        """Get user by email address."""
        return await db.user.find_unique(where={"email": email})

    async def create_user(
        self,
        db: Prisma,
        email: str,
        hashed_password: str,
        name: str,
        role: Role = Role.AGENT,
    ):
        """Create a new user."""
        return await db.user.create(
            data={
                "email": email,
                "hashed_password": hashed_password,
                "name": name,
                "role": role.value,
            }
        )

    async def list_users(self, db: Prisma, limit: int = 100, offset: int = 0):
        """List all users with pagination."""
        return await db.user.find_many(
            order={"createdAt": "desc"},
            take=limit,
            skip=offset,
        )


user_repo = UserRepository()

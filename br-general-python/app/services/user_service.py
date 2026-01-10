from app.schemas.user import UserCreate, UserOut
from app.repositories.user_repository import UserRepository
from app.services.auth_service import auth_service


class UserService:
    """User-related business logic."""

    def __init__(self, user_repo: UserRepository) -> None:
        self.user_repo = user_repo

    async def create_user(self, user: UserCreate) -> UserOut:
        """
        Create a new user with hashed password.
        """
        hashed_password = auth_service.hash_password(user.password)

        db_user = await self.user_repo.create(
            email=user.email,
            hashed_password=hashed_password,
            name=user.name,
            role=user.role,
        )

        return UserOut.model_validate(db_user)

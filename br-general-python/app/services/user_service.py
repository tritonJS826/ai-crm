from app.schemas.user import UserCreate, UserResponse
from app.repositories.user_repository import UserRepository


class UserService:
    @staticmethod
    async def create_user(user: UserCreate) -> UserResponse:
        db_user = await UserRepository.create(user)
        return UserResponse.model_validate(db_user)

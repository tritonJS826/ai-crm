from fastapi import APIRouter, Depends, HTTPException, Header, Response, status
from fastapi.security import OAuth2PasswordBearer

from jose import JWTError, ExpiredSignatureError, jwt

from prisma.errors import RecordNotFoundError

from app.schemas.user import (
    UserWithTokens,
    UserOut,
    UserPersonalInfo,
    UserProfileUpdate,
)
from app.services.auth_service import AuthService
from app.repositories.user_repository import UserRepository
from app.db import db

from app.settings import settings

router = APIRouter()

auth_service = AuthService()
user_repo = UserRepository()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/br-general/auth/login")


async def get_current_user(
    access_token: str = Depends(oauth2_scheme),
    x_refresh_token: str | None = Header(default=None),
):
    # try access first
    if access_token:
        try:
            payload = jwt.decode(
                access_token,
                settings.jwt_secret_key,
                algorithms=[settings.jwt_algorithm],
            )
            user_id = payload.get("sub")
            # return existing tokens (still valid)
            return {
                "user_id": user_id,
                "tokens": {
                    "access_token": access_token,
                    # may be None if not sent
                    "refresh_token": x_refresh_token,
                    "token_type": "bearer",
                },
            }

        except ExpiredSignatureError:
            if not x_refresh_token:
                raise HTTPException(status_code=401, detail="Access token expired")
            # will fall back to refresh

        except JWTError:
            if not x_refresh_token:
                raise HTTPException(status_code=401, detail="Invalid token")

    # fallback: refresh token
    if x_refresh_token:
        refresh_payload = auth_service.decode_token(x_refresh_token)
        if not refresh_payload or refresh_payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        user_id = refresh_payload.get("sub")
        new_access = auth_service.create_access_token({"sub": user_id})

        return {
            "user_id": user_id,
            "tokens": {
                "access_token": new_access,
                "refresh_token": x_refresh_token,
                "token_type": "bearer",
            },
        }

    raise HTTPException(status_code=401, detail="Not authenticated")


@router.get("/me", response_model=UserWithTokens)
async def read_users_me(
    current=Depends(get_current_user),
    x_refresh_token: str | None = Header(default=None),
):
    user = await db.user.find_unique(where={"id": str(current["user_id"])})
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    user_out = UserOut(
        id=str(user.id), email=user.email, name=user.name, role=user.role
    )

    return UserWithTokens(user=user_out, tokens=current["tokens"])


@router.get("/me/personal", response_model=UserPersonalInfo)
async def get_personal_info(current=Depends(get_current_user)):
    user_id = current["user_id"]
    user = await user_repo.get_personal_info(db, user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_subscription = user.subscriptions[0]

    # collect unique test ids and titles from sessions
    user_topics = [
        {"id": s.test.id, "title": s.test.title} for s in user.sessions if s.test
    ]

    # remove duplicates
    seen = set()
    unique_topics = [
        t for t in user_topics if not (t["id"] in seen or seen.add(t["id"]))
    ]

    return {
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "plan": user_subscription.plan,
        "city": user.city,
        "phone": user.phone,
        "language": user.language,
        "consultations_used": user_subscription.consultationsUsed,
        "consultations_included": user_subscription.consultationsIncluded,
        "days_to_end": (user_subscription.endsAt - user_subscription.startedAt).days,
        # add uniq test titles
        "test_topics": unique_topics,
    }


@router.get("/me/tests/{test_id}")
async def get_user_test_results(test_id: str, current=Depends(get_current_user)):
    user_id = current["user_id"]

    # Fetch all user sessions for this test
    sessions = await db.testsession.find_many(
        where={"userId": user_id, "testId": test_id},
        include={
            "answers": {
                "include": {
                    "question": True,
                    "answerOption": True,
                }
            },
            # include test details (title, description)
            "test": True,
        },
    )

    if not sessions:
        raise HTTPException(status_code=404, detail="No sessions found for this test")

    # use the first session’s test info as metadata (same for all sessions)
    test_info = sessions[0].test

    results = []
    for session in sessions:
        results.append(
            {
                "session_id": session.id,
                "created_at": session.createdAt,
                "finished_at": session.finishedAt,
                "answers": [
                    {
                        "question_id": a.questionId,
                        "question_text": a.question.text,
                        "answer": a.answerOption.text,
                    }
                    for a in session.answers
                ],
            }
        )

    return {
        "test_id": test_info.id,
        "title": test_info.title,
        "description": test_info.description,
        "sessions": results,
    }


@router.get("/me/profile")
async def get_user_profile(current=Depends(get_current_user)):
    user_id = current["user_id"]
    user = await db.user.find_unique(where={"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "email": user.email,
        "name": user.name,
        "city": user.city,
        "phone": user.phone,
        "language": user.language,
    }


@router.patch(
    "/me/profile",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Partially Update User Profile",
    response_description="No content (partial update successful)",
    tags=["users"],
)
async def patch_user_profile(
    data: UserProfileUpdate,
    current=Depends(get_current_user),
):
    user_id = current["user_id"]
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    try:
        await db.user.update(where={"id": user_id}, data=update_data)
    except RecordNotFoundError:
        raise HTTPException(status_code=404, detail="User not found")

    return Response(status_code=status.HTTP_204_NO_CONTENT)

from __future__ import annotations

from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status
from prisma import Prisma

from app.repositories.tests_repo import (
    get_test_with_questions_repo,
    create_test_session_repo,
    save_answers_bulk_repo,
    finish_session_with_stats_repo,
    fetch_finished_tests_repo,
    fetch_finished_topics_repo,
)

# Read queries


async def get_test_questions_service(db: Prisma, *, test_id: str) -> Dict[str, Any]:
    """Return test with topic and questions."""
    test = await get_test_with_questions_repo(db, test_id)
    if not test:
        raise HTTPException(status_code=404, detail="TEST_NOT_FOUND")

    topic_id = test.topicId

    return {
        "testId": test.id,
        "topicId": topic_id,
        "questions": [
            {
                "id": question.id,
                "text": question.text,
                "type": question.type,
                "options": [
                    {"id": option.id, "text": option.text}
                    for option in (question.options or [])
                ],
            }
            for question in (test.questions or [])
        ],
    }


# Write queries


async def save_bulk_answers_service(
    db: Prisma,
    *,
    test_id: str,
    answers: List[Dict[str, Any]],
    stats: Dict[str, int],
    user_id: Optional[str],
    session_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Save answers in bulk for an authenticated user and auto-finish the session.
    Anonymous users cannot save, but they can read questions.
    """
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="AUTH_REQUIRED"
        )

    # validate test exists
    test = await get_test_with_questions_repo(db, test_id)
    if not test:
        raise HTTPException(status_code=404, detail="TEST_NOT_FOUND")

    # open a session
    session = await create_test_session_repo(db, test_id=test_id, user_id=user_id)

    # save answer
    saved_count = await save_answers_bulk_repo(
        db, session_id=session.id, answers=answers
    )

    # save stats and close session
    await finish_session_with_stats_repo(
        db,
        session_id=session.id,
        stats=stats,
    )

    return {
        "sessionId": session.id,
        "savedCount": saved_count,
        "isFinished": True,
    }


# Reports


async def get_finished_tests_service(
    db: Prisma, *, user_id: str, topic_id: Optional[str]
) -> List[Dict[str, Any]]:
    """
    All finished test attempts for the current user.
    Repo already returns dicts: {testTitle, finishedAt, stats}.
    """
    sessions = await fetch_finished_tests_repo(db, user_id=user_id, topic_id=topic_id)

    results: List[Dict[str, Any]] = []
    for session in sessions:
        stats_dict = {
            stat.key: stat.value for stat in (getattr(session, "stats", None) or [])
        }
        results.append(
            {
                "testTitle": session.test.title,
                "finishedAt": session.finishedAt,
                "stats": stats_dict,
            }
        )
    return results


async def get_finished_topics_service(
    db: Prisma, *, user_id: str
) -> List[Dict[str, Any]]:
    """
    All topics where the user has at least one finished test with last finished date.
    """
    return await fetch_finished_topics_repo(db, user_id=user_id)

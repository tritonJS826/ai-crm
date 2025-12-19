from __future__ import annotations

from datetime import datetime, timezone
from prisma import Prisma
from typing import Any, Dict, List, Optional


# Read queries


async def get_test_with_questions_repo(
    db: Prisma, test_id: str
) -> Optional[Dict[str, Any]]:
    """
    Load test with topic, questions and answer options.
    Used by: GET /tests/{test_id}/questions
    """
    return await db.test.find_unique(
        where={"id": test_id},
        include={
            "topic": True,
            "questions": {
                "include": {
                    "options": {
                        "include": {},
                    }
                },
            },
        },
    )


async def fetch_finished_tests_repo(
    db: Prisma,
    *,
    user_id: str,
    topic_id: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Return finished sessions for a user (optionally filter by topic).
    Used by: GET /tests/finished
    """
    where: Dict[str, Any] = {"userId": user_id, "finishedAt": {"not": None}}
    if topic_id:
        # Filter by specific topic through relation to Test
        where["test"] = {"topicId": topic_id}

    sessions = await db.testsession.find_many(
        where=where,
        order={"finishedAt": "desc"},
        include={
            "test": True,
            "stats": True,  # pull SessionStat[] to build {key: value}
        },
    )
    return sessions


async def fetch_finished_topics_repo(
    db: Prisma, *, user_id: str
) -> List[Dict[str, Any]]:
    """
    Topics where the user has at least one finished test, with last finished date.
    Used by: GET /tests/finished/topics
    """
    sessions = await db.testsession.find_many(
        where={"userId": user_id, "finishedAt": {"not": None}},
        order={"finishedAt": "desc"},
        include={
            "test": {
                "include": {
                    "topic": True,
                }
            }
        },
    )

    last_by_topic: Dict[str, Any] = {}
    for session in sessions:
        topic = session.test.topic
        if not topic:
            continue
        topic_id = topic.id
        prev = last_by_topic.get(topic_id)
        if not prev or (
            session.finishedAt and session.finishedAt > prev["lastFinishedAt"]
        ):
            last_by_topic[topic_id] = {
                "topicId": topic_id,
                "topicTitle": topic.title,
                "lastFinishedAt": session.finishedAt,
            }

    return list(last_by_topic.values())


# Write queries


async def create_test_session_repo(
    db: Prisma,
    *,
    test_id: str,
    user_id: str,
) -> Dict[str, Any]:
    """
    Create a new session.
    Used by: POST /tests/save-bulk
    """
    return await db.testsession.create(
        data={
            "user": {"connect": {"id": user_id}},
            "test": {"connect": {"id": test_id}},
        }
    )


async def save_answers_bulk_repo(
    db: Prisma,
    *,
    session_id: str,
    answers: List[Dict[str, Any]],
) -> None:
    """
    Save all answers for a session.
    """
    for answer in answers:
        question_id: str = answer.get("questionId")
        if not question_id:
            raise ValueError("Missing required field: questionId")

        # CHECKBOX
        selected_option_ids = answer.get("selectedOptionIds")
        if isinstance(selected_option_ids, list) and selected_option_ids:
            for option_id in selected_option_ids:
                await db.givenanswer.create(
                    data={
                        "sessionId": session_id,
                        "questionId": question_id,
                        "answerOptionId": option_id,
                    }
                )
            continue

        # Single option (RADIO)
        single_option_id = answer.get("answerOptionId")
        if single_option_id:
            await db.givenanswer.create(
                data={
                    "sessionId": session_id,
                    "questionId": question_id,
                    "answerOptionId": single_option_id,
                }
            )
            continue

        # TEXT
        free_text = answer.get("textAnswer") or answer.get("freeText")
        if free_text:
            await db.givenanswer.create(
                data={
                    "sessionId": session_id,
                    "questionId": question_id,
                    "freeText": free_text,
                }
            )
            continue


async def finish_session_with_stats_repo(
    db: Prisma,
    *,
    session_id: str,
    stats: Dict[str, int],
) -> None:
    """
    Store key/value metrics into SessionStat and mark session as finished.
    """
    # Upsert each metric into SessionStat (unique by (sessionId, key))
    for metric_key, metric_value in (stats or {}).items():
        try:
            await db.sessionstat.upsert(
                where={
                    "sessionId_key": {"sessionId": session_id, "key": str(metric_key)}
                },
                data={
                    "create": {
                        "sessionId": session_id,
                        "key": str(metric_key),
                        "value": int(metric_value),
                    },
                    "update": {
                        "value": int(metric_value),
                    },
                },
            )
        except Exception:
            pass

    await db.testsession.update(
        where={"id": session_id},
        data={
            "finishedAt": datetime.now(timezone.utc),
            "isFinished": True,
        },
    )

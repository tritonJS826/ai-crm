from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime


class AnswerOption(BaseModel):
    """Represents one selectable answer option for a question."""

    id: str = Field(..., description="Unique identifier of the answer option.")
    text: str = Field(..., description="Display text of the answer option.")


class Question(BaseModel):
    """Represents a single question in a test."""

    id: str = Field(..., description="Unique identifier of the question.")
    text: str = Field(..., description="Question text.")
    type: str = Field(..., description="Type of question: RADIO, CHECKBOX, or TEXT.")
    options: Optional[List[AnswerOption]] = Field(
        default=None,
        description="List of possible answer options. Empty for text questions.",
    )


class TestQuestionsResponse(BaseModel):
    """API response: test structure with questions and options."""

    test_id: str = Field(..., alias="testId", description="ID of the test.")
    topic_id: str = Field(..., alias="topicId", description="ID of the related topic.")
    questions: List[Question] = Field(
        ..., description="List of questions included in the test."
    )


class BulkAnswerItem(BaseModel):
    """Represents one user answer to a question."""

    question_id: str = Field(
        ..., alias="questionId", description="ID of the question being answered."
    )
    selected_option_ids: Optional[List[str]] = Field(
        default=None,
        alias="selectedOptionIds",
        description="IDs of selected options (for CHECKBOX type questions).",
    )
    free_text: Optional[str] = Field(
        default=None,
        alias="freeText",
        description="Free text answer (for TEXT type questions).",
    )


class BulkSaveAnswersRequest(BaseModel):
    """Request body for saving all answers and related statistics."""

    test_id: str = Field(..., alias="testId", description="ID of the test.")
    answers: List[BulkAnswerItem] = Field(
        ..., description="List of all user answers for the test."
    )
    stats: Dict[str, int] = Field(
        default_factory=dict,
        description="Optional pre-calculated statistics from frontend (e.g. {'score': 5}).",
    )


class BulkSaveAnswersResponse(BaseModel):
    """Response after successfully saving user answers."""

    session_id: str = Field(
        ..., alias="sessionId", description="ID of the created test session."
    )
    saved_count: int = Field(
        ..., alias="savedCount", description="Number of answers successfully saved."
    )
    is_finished: bool = Field(
        ..., alias="isFinished", description="Indicates whether the session was closed."
    )


class UserTestResult(BaseModel):
    """One finished test summary for a user within a topic"""

    testTitle: str = Field(..., description="Title of the completed test.")
    finishedAt: datetime = Field(
        ..., description="Timestamp when the test was completed."
    )
    stats: Dict[str, int] = Field(
        ...,
        description="Key-value pairs representing computed statistics for this test.",
    )

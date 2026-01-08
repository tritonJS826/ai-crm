# app/schemas/email.py
from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr, field_validator, Field


class EmailSendRequest(BaseModel):
    to: EmailStr
    subject: str
    text: Optional[str] = None
    html: Optional[str] = None
    # e.g. "welcome.html"
    template: Optional[str] = None
    # variables for template
    params: Dict[str, Any] = Field(default_factory=dict)

    @field_validator("subject")
    @classmethod
    def _subject_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Subject cannot be empty")
        return v

    @field_validator("html")
    @classmethod
    def _at_least_one_content(cls, v: Optional[str], info):
        text = info.data.get("text")
        template = info.data.get("template")
        if not any(value and str(value).strip() for value in (v, text, template)):
            raise ValueError("Provide at least one of: text, html, or template")
        return v


class EmailSendResponse(BaseModel):
    accepted: bool
    message: str = "Email scheduled for delivery"

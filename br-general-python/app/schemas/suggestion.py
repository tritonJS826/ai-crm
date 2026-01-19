from datetime import datetime
from pydantic import BaseModel


class SuggestionOut(BaseModel):
    id: str
    conversationId: str
    text: str
    createdAt: datetime

    model_config = {"from_attributes": True, "populate_by_name": True}

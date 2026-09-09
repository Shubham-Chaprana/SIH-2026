from __future__ import annotations

from pydantic import BaseModel


class ReviewIn(BaseModel):
    event_id: str
    review_status: str = "incorrect"
    reviewed_class: str | None = None
    reviewer_note: str | None = None


class ReviewOut(BaseModel):
    id: str
    event_id: str
    predicted_class: str | None = None
    reviewed_class: str | None = None
    review_status: str
    reviewer_note: str | None = None
    feedback_available: bool = True

from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class InvestigatorAskIn(BaseModel):
    event_id: str | None = None
    question: str


class EvidenceChip(BaseModel):
    type: str
    field: str
    value: Any


class InvestigatorAskOut(BaseModel):
    answer: str
    evidence: list[EvidenceChip] = []
    provider: str = "rules"
    event_id: str | None = None

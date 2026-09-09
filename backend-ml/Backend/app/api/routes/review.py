from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.logging import get_logger
from app.db import models as m
from app.db.database import get_db
from app.schemas.reviews import ReviewIn, ReviewOut

router = APIRouter(tags=["reviews"])
log = get_logger("reviews")


@router.post("/reviews", response_model=ReviewOut)
def submit_review(body: ReviewIn, db: Session = Depends(get_db)):
    ev = db.get(m.ThermalEvent, body.event_id)
    if not ev:
        raise HTTPException(404, f"Event {body.event_id} not found")
    r = m.Review(event_id=body.event_id, predicted_class=ev.current_classification,
                 reviewed_class=body.reviewed_class, review_status=body.review_status,
                 reviewer_note=body.reviewer_note)
    db.add(r)
    ev.status = "reviewed"
    db.commit()
    db.refresh(r)
    log.info("review event=%s status=%s", body.event_id, body.review_status)
    return ReviewOut(id=r.id, event_id=r.event_id, predicted_class=r.predicted_class,
                     reviewed_class=r.reviewed_class, review_status=r.review_status,
                     reviewer_note=r.reviewer_note, feedback_available=True)


@router.get("/reviews")
def list_reviews(limit: int = 50, db: Session = Depends(get_db)):
    rows = db.execute(select(m.Review).order_by(m.Review.created_at.desc()).limit(min(limit, 200))).scalars().all()
    return {"items": [{"id": r.id, "event_id": r.event_id, "predicted_class": r.predicted_class,
                       "reviewed_class": r.reviewed_class, "review_status": r.review_status,
                       "reviewer_note": r.reviewer_note, "created_at": r.created_at} for r in rows],
            "feedback_available": len(rows) > 0,
            "note": "Reviews are stored as future training feedback; production model is never auto-retrained."}

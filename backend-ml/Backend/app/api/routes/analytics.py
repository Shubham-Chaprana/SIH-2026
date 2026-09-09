from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services import analytics_service

router = APIRouter(tags=["analytics"])


@router.get("/analytics/summary")
def summary(db: Session = Depends(get_db)):
    return analytics_service.summary(db)


@router.get("/analytics/timeseries")
def timeseries(days: int = 30, db: Session = Depends(get_db)):
    return {"items": analytics_service.timeseries(db, days)}


@router.get("/analytics/classifications")
def classifications(db: Session = Depends(get_db)):
    return {"items": analytics_service.classifications(db)}


@router.get("/analytics/risk-distribution")
def risk_distribution(db: Session = Depends(get_db)):
    return {"items": analytics_service.risk_distribution(db)}


@router.get("/analytics/regions")
def regions(db: Session = Depends(get_db)):
    return {"items": analytics_service.regions(db)}

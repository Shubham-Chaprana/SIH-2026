"""THERMOS FastAPI entrypoint: graceful startup/shutdown, scheduler optional."""
from __future__ import annotations

from contextlib import asynccontextmanager

from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import alerts, analytics, demo, events, health, investigator, legacy, prediction, review, system
from app.core.config import get_settings
from app.core.logging import get_logger, setup_logging
from app.db.database import Base, engine

log = get_logger("main")
scheduler: BackgroundScheduler | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global scheduler
    s = get_settings()
    setup_logging(s.LOG_LEVEL)
    log.info("Starting %s %s env=%s", s.APP_NAME, s.APP_VERSION, s.ENVIRONMENT)
    # 2-3. connect + verify DB (create tables if needed; Alembic used for prod migrations)
    Base.metadata.create_all(bind=engine)
    log.info("Database ready (postgres=%s)", s.is_postgres)
    # 4. load ML model once
    try:
        from app.ml import model_loader
        model_loader.load_artifacts()
        log.info("ML model loaded")
    except Exception as e:  # noqa: BLE001
        log.error("ML model failed to load: %s (API still starts, /predict will 503)", e)
    # 6. optional scheduler
    if s.ENABLE_SCHEDULER and s.FIRMS_MAP_KEY:
        try:
            from app.workers.firms_ingestion import poll_once
            scheduler = BackgroundScheduler()
            scheduler.add_job(poll_once, "interval", minutes=s.FIRMS_POLL_INTERVAL_MIN,
                              kwargs={"data_mode": "live"})
            scheduler.start()
            log.info("FIRMS scheduler started every %s min", s.FIRMS_POLL_INTERVAL_MIN)
        except Exception as e:  # noqa: BLE001
            log.warning("Scheduler failed to start: %s", e)
    else:
        log.info("Scheduler disabled (ENABLE_SCHEDULER=%s)", s.ENABLE_SCHEDULER)
    yield
    # 84. graceful shutdown
    if scheduler:
        scheduler.shutdown(wait=False)
    engine.dispose()
    log.info("Shutdown complete")


def create_app() -> FastAPI:
    s = get_settings()
    app = FastAPI(title=s.APP_NAME, version=s.APP_VERSION, lifespan=lifespan)
    app.add_middleware(CORSMiddleware, allow_origins=s.cors_origins_list,
                       allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

    @app.exception_handler(Exception)
    async def unhandled(request: Request, exc: Exception):  # noqa: ANN001, ANN202
        log.exception("Unhandled error on %s", request.url.path)
        return JSONResponse(status_code=500, content={"error": {"code": "INTERNAL_ERROR",
                         "message": "An internal error occurred.", "details": {}}})

    for r in (health.router, events.router, prediction.router, analytics.router,
              alerts.router, investigator.router, review.router, system.router,
              demo.router, legacy.router):
        app.include_router(r, prefix="/api")
    return app


app = create_app()

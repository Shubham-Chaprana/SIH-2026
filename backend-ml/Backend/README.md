# THERMOS — Satellite Thermal Intelligence (Backend)

> **Synthetic-data disclaimer:** the bundled development dataset (`THERMOS_ML_Core_15_Columns.csv`,
> 36k balanced rows) is **synthetic development data, NOT real NASA FIRMS ground truth**.
> Model metrics describe that dataset only. Replace with verified FIRMS-derived training data
> without architecture changes; `data_mode` (`demo`/`live`) is exposed on every event.

## Architecture
`docs/architecture.md` (also `backend/docs/architecture.md`). Flow:
FIRMS → ingestion → event association → temporal + geo enrichment (OSM/landcover/WorldPop)
→ 14-feature vector → XGBoost → explainability + risk engine → Postgres/PostGIS → REST → frontend/AI investigator.

## Quickstart (local, SQLite demo)
```bash
cd backend
pip install -r requirements.txt
copy .env.example .env   # or: cp .env.example .env
python scripts/initialize_db.py
python scripts/seed_demo_data.py 120
uvicorn app.main:app --reload --port 8000
```
Swagger: http://localhost:8000/docs · Health: `GET /api/health`

## Docker (Postgres + PostGIS)
```bash
cd backend
docker compose up --build
docker compose exec backend alembic upgrade head
docker compose exec backend python scripts/seed_demo_data.py 120
```

## Env vars
See `.env.example`: `DATABASE_URL`, `FIRMS_MAP_KEY`, `FIRMS_API_BASE_URL`, `LLM_PROVIDER`,
`OPENAI_API_KEY`, `GEMINI_API_KEY`, `MODEL_PATH`, `ENABLE_LIVE_FIRMS`, `ENABLE_AI`,
`ENABLE_SCHEDULER`, `OSM_OVERPASS_URL`, `WORLDPOP_DATA_PATH`, `LANDCOVER_DATA_PATH`,
`LOG_LEVEL`, `CORS_ORIGINS`. Never commit `.env`.

## FIRMS live mode
Set `FIRMS_MAP_KEY` + `ENABLE_LIVE_FIRMS=true` (+ optionally `ENABLE_SCHEDULER=true`).
VIIRS `l/n/h` confidence is mapped (30/60/90 proxy) with raw preserved — never shown as %.

## AI investigator
`LLM_PROVIDER=openai|gemini|none`, keys via env. Rule-grounded answers always work;
LLM only elaborates from supplied evidence.

## Tests
```bash
cd backend
pytest -q
```

## Known limitations
- Demo geo fallbacks are heuristic (marked `demo-fallback`), not real Copernicus/WorldPop rasters.
- OSM enrichment degrades gracefully offline.
- Model accuracy (~0.99 test) reflects synthetic separability, not field performance.
- Risk score = operational priority, not disaster probability.

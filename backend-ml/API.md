# THERMOS API

Base: `http://localhost:8000` · Swagger: `/docs`. Errors: `{error:{code,message,details}}`.

## Health
`GET /api/health` → `{status, version, model_loaded, database_connected, firms_enabled, ai_enabled}`

## Events
- `GET /api/events?bbox=&lat=&lon=&radius_km=&classification=&risk_level=&min_confidence=&start_time=&end_time=&status=&page=&limit=`
  → `{items:[{id,latitude,longitude,classification,confidence(0-100),risk_score,risk_level,persistence_hours,frp_mw,status}], page,limit,total}`
- `GET /api/events/{id}` → full intelligence (identity, classification+probabilities, risk+factors,
  temporal, observations, geospatial, population, land cover, explainability, data_quality, data_mode, model_version…)
- `POST /api/events/process` — FIRMS-style obs in, full intelligence out:
  `{"latitude":23.0225,"longitude":72.5714,"acquired_at":"2026-08-31T14:32:00Z","brightness_k":348.7,"frp_mw":31.4,"confidence":"h","daynight":"N"}`
- `PATCH /api/events/{id}/status` `{"status":"acknowledged"}` (active|acknowledged|investigating|reviewed|dismissed|resolved)
- `GET /api/events/{id}/similar?top_n=5`

## Prediction
- `POST /api/predict` (same FIRMS-obs body; primary workflow)
- `POST /api/dev/predict-features` (14 raw features; dev only, 403 in production)

## Alerts
`GET /api/alerts?risk=HIGH&classification=&status=&since=` (risk_score ≥ `ALERT_RISK_THRESHOLD`, default 65)

## Analytics
`GET /api/analytics/summary|timeseries|classifications|risk-distribution|regions`

## Investigator
- `POST /api/investigator/ask` `{"event_id":"IND-…","question":"Why is this high risk?"}` → `{answer, evidence:[{type,field,value}], provider}`
- `GET /api/investigator/sessions?event_id=`

## Reviews
- `POST /api/reviews` `{"event_id","review_status":"incorrect","reviewed_class":"…","reviewer_note":"…"}`
- `GET /api/reviews` (stored as future-training feedback; never auto-retrains)

## System / demo / legacy
- `GET /api/system/status`, `GET /api/system/pipeline`
- `POST /api/demo/scenario/{industrial_fire|agricultural_burn|wildfire|gas_flare}`
- `GET /api/anomalies`, `GET /api/stats` (compat for existing frontend)

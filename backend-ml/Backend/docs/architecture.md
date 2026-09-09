# THERMOS Architecture

```
                NASA FIRMS
                     │
                     ▼
             FIRMS INGESTION
                     │
                     ▼
            EVENT ASSOCIATION
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
    TEMPORAL ENGINE       GEO ENRICHMENT
          │                     │
          │              ┌──────┼─────────┐
          │              ▼      ▼         ▼
          │             OSM  LANDCOVER  WORLDPOP
          │              │      │         │
          └──────────────┴──────┴─────────┘
                     │
                     ▼
               FEATURE ENGINE
                     │
                     ▼
                ML MODEL
                     │
                CLASSIFICATION
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
   EXPLAINABILITY            RISK ENGINE
         │                       │
         └───────────┬───────────┘
                     ▼
                 DATABASE
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
       REST API            AI INVESTIGATOR
          │                     │
          └──────────┬──────────┘
                     ▼
                 FRONTEND
```

Modules are swappable: `firms_service`, `osm_service`, `geo_enrichment` (landcover/pop),
`app/ml/predictor.py` (model), `investigator_service` (LLM provider) — each behind a narrow
function boundary, no cross-imports of constants (all tunable values in `app/core/config.py`).

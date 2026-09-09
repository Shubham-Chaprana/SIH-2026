"""Full geospatial enrichment orchestrator (OSM + land cover + population + proximities)."""
from __future__ import annotations

from typing import Any

from app.services import geo_enrichment as ge
from app.services import osm_service


def enrich_location(lat: float, lon: float) -> dict[str, Any]:
    osm = osm_service.query_osm(lat, lon)
    lc = ge.get_land_cover(lat, lon)
    pop = ge.get_population(lat, lon)
    prox = ge.derive_proximities(lat, lon, osm)
    demo_geo = lc.get("is_demo", True) or pop.get("is_demo", True)
    sources = {
        "osm": osm.get("source_status", "unavailable"),
        "land_cover": lc.get("land_cover_source", "demo-fallback"),
        "population": pop.get("population_source", "demo-fallback"),
    }
    return {
        "industrial_proximity_km": prox["industrial_proximity_km"],
        "refinery_proximity_km": prox["refinery_proximity_km"],
        "mine_proximity_km": prox["mine_proximity_km"],
        "forest_proximity_km": prox["forest_proximity_km"],
        "cropland_proximity_km": prox["cropland_proximity_km"],
        "population_5km": pop["population_5km"],
        "population_source": pop["population_source"],
        "population_timestamp": pop["population_timestamp"],
        "land_cover": lc["land_cover"],
        "land_cover_source": lc["land_cover_source"],
        "nearby_infrastructure": {
            "counts": osm.get("counts", {}),
            "nearest": osm.get("nearest", {}),
            "source_status": osm.get("source_status", "unavailable"),
        },
        "enrichment_sources": sources,
        "is_demo_geo": demo_geo,
    }

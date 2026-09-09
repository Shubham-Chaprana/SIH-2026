from __future__ import annotations

from fastapi import Query

from app.core.config import get_settings

MAX_LIMIT = 200


def pagination(page: int = Query(1, ge=1), limit: int = Query(50, ge=1, le=200)):
    s = get_settings()
    lim = min(limit, s.MAX_API_PAGE_SIZE)
    return {"page": page, "limit": lim, "offset": (page - 1) * lim}

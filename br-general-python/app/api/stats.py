from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Query
from app.db import db

router = APIRouter()

ORDER_MAP = {
    "total": "total_exec_time DESC",
    "mean": "mean_exec_time DESC",
    "io": "(COALESCE(blk_read_time,0)+COALESCE(blk_write_time,0)) DESC",
    "calls": "calls DESC",
}

BASE_SQL = r"""
SELECT
  query,
  calls,
  total_exec_time AS total_ms,
  mean_exec_time  AS mean_ms,
  rows,
  shared_blks_hit,
  shared_blks_read,
  COALESCE(blk_read_time,0)  AS blk_read_ms,
  COALESCE(blk_write_time,0) AS blk_write_ms
FROM public.pg_stat_statements
WHERE calls >= $1
ORDER BY {order}
LIMIT $2;
"""


@router.get("/top-sql")
async def top_sql(
    limit: int = Query(20, ge=1, le=100),
    sort_by: str = Query("total", pattern="^(total|mean|io|calls)$"),
    min_calls: int = Query(5, ge=1, le=1000),
):
    order_sql = ORDER_MAP.get(sort_by)
    if not order_sql:
        raise HTTPException(status_code=400, detail="Invalid sort_by")

    sql = BASE_SQL.format(order=order_sql)

    try:
        rows = await db.query_raw(sql, min_calls, limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    items = [
        {
            "query": r["query"],
            "calls": int(r["calls"]),
            "total_ms": float(r["total_ms"]),
            "mean_ms": float(r["mean_ms"]),
            "rows": int(r["rows"]),
            "shared_blks_hit": int(r["shared_blks_hit"]),
            "shared_blks_read": int(r["shared_blks_read"]),
            "blk_read_ms": float(r["blk_read_ms"]),
            "blk_write_ms": float(r["blk_write_ms"]),
        }
        for r in rows
    ]

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "limit": limit,
        "sort_by": sort_by,
        "min_calls": min_calls,
        "items": items,
    }

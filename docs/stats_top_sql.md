# Stats API — Top SQL (v1.2)

## Endpoint
`GET /br-general/stats/top-sql`

### Method
`GET`

### Auth Required
No — this is a **public technical endpoint**

---

### Description
Returns the **top N most time-consuming SQL statements** recorded by PostgreSQL via the `pg_stat_statements` extension. Useful for database performance monitoring and profiling.

>   Requirements:
> - PostgreSQL must have `shared_preload_libraries = 'pg_stat_statements'` enabled.
> - The target database must have the extension installed: `CREATE EXTENSION IF NOT EXISTS pg_stat_statements;`.
> - The endpoint queries `pg_stat_statements` directly (no caching/aggregation layer).

---

### Query Parameters

| Parameter   | Type | Default | Range   | Description                                                                 |
|-------------|------|---------|---------|-----------------------------------------------------------------------------|
| `limit`     | int  | 20      | 1–100   | How many queries to return                                                  |
| `sort_by`   | str  | `"total"` | —     | Sort field: `total` (total exec time), `mean` (avg exec time), `io` (I/O time), `calls` (total calls) |
| `min_calls` | int  | 5       | 1–1000  | Minimum number of calls to include a query (filters rare/noisy statements)  |

> Version note: newer PostgreSQL versions expose `total_exec_time` and `mean_exec_time`. The endpoint accounts for this.

---

### Example Requests

**Top by total execution time**
```bash
curl "http://localhost:8000/br-general/stats/top-sql?limit=5&sort_by=total"
```

**Top by average execution time (filter rare queries)**
```bash
curl "http://localhost:8000/br-general/stats/top-sql?limit=5&sort_by=mean&min_calls=5"
```

**Top by number of calls**
```bash
curl "http://localhost:8000/br-general/stats/top-sql?limit=10&sort_by=calls"
```

**Top by I/O (read/write time)**
```bash
curl "http://localhost:8000/br-general/stats/top-sql?limit=5&sort_by=io"
```
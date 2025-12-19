\c mastersway_db

ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET pg_stat_statements.max = '10000';
ALTER SYSTEM SET pg_stat_statements.track = 'all';

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
FROM postgres:16.2-alpine
CMD ["postgres", "-c", "shared_preload_libraries=pg_stat_statements"]
COPY postgres/postgres-general.init.sql /docker-entrypoint-initdb.d/
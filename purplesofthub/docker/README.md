# Docker Layout

This folder holds the Docker-specific support files for PurpleSoftHub.

- `docker/nginx/` optional reverse-proxy config
- `docker/postgres/` local PostgreSQL init scripts
- `docker/scripts/` helper scripts for container bootstrap and maintenance
- `docker/dev/` development-only notes and overrides
- `docker/prod/` production-only notes and overrides

The default local stack is driven by `docker-compose.yml`.

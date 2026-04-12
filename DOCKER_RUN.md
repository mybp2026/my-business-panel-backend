# Docker Setup Guide

## Prerequisites

- Docker and Docker Compose installed
- `.env` file filled with the correct values (see `.env.example`)

The database schema is automatically initialized on first run via the bootstrap script located in `my-business-panel-database/`. No manual SQL execution is needed.

---

## Development Mode

```bash
docker compose -f docker-compose.dev.yml up -d
```

### First time / reset database

If you need to reinitialize the database from scratch (re-runs the bootstrap):

```bash
docker compose -f docker-compose.dev.yml down
rm -rf ./postgres-data
docker compose -f docker-compose.dev.yml up -d
```

### Services available after startup

| Service        | URL                        | Credentials (default)          |
|----------------|----------------------------|--------------------------------|
| PostgreSQL      | `localhost:5432`           | See `.env`                     |
| pgAdmin        | http://localhost:8080      | `admin@admin.com` / `admin`    |
| Redis           | `localhost:6379`           | See `.env`                     |
| Redis Insight  | http://localhost:5540      | —                              |

---

## Production Mode

```bash
docker compose -f docker-compose.prod.yml up -d
```

---

## Check bootstrap logs

To verify the database initialized correctly:

```bash
docker logs my-business-panel-postgres | grep -E "(ERROR|Bootstrap completado|ready to accept)"
```

Expected output on success:
```
database system is ready to accept connections
Bootstrap completado exitosamente.
```

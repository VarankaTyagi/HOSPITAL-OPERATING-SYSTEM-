# HospitalOS — Deployment & Infrastructure Guide

## 1. Overview

HospitalOS is fully containerized with production-ready multi-stage Dockerfiles for both `@hospitalos/api` and `@hospitalos/web`, alongside a root `docker-compose.yml` orchestrating PostgreSQL, Redis, backend, and frontend services.

---

## 2. Docker Compose Quickstart

To launch the complete HospitalOS environment with a single command:

```bash
docker compose up -d --build
```

### Verified Service Architecture:
- **`hospitalos-postgres`**: PostgreSQL 16 database running on port `5432`.
- **`hospitalos-redis`**: Redis 7 memory cache and pub/sub broker on port `6379`.
- **`hospitalos-api`**: NestJS API container on port `4000`.
- **`hospitalos-web`**: Next.js App Router portal on port `3000`.

---

## 3. Environment Variables Reference

| Variable Name | Default Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Execution environment |
| `PORT` | `4000` (API) / `3000` (Web) | Listening port |
| `DATABASE_URL` | `postgresql://postgres:postgres@postgres:5432/hospitalos?schema=public` | PostgreSQL connection string |
| `JWT_SECRET` | `hospitalos_super_secret_jwt_key_2026` | Key used for signing session tokens |
| `JWT_EXPIRATION` | `7d` | Token lifetime |
| `REDIS_URL` | `redis://redis:6379` | Optional Redis broker URI |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000/api` | Client-facing backend URL |
| `NEXT_PUBLIC_WS_URL` | `ws://localhost:4000` | Client-facing WebSocket URL |

---

## 4. Production Hardening Checklist

1. **Reverse Proxy (Nginx / Cloudflare)**: Terminate SSL/TLS (HTTPS & WSS) at reverse proxy boundary.
2. **Database Migrations**: Run `npx prisma migrate deploy` in deployment pipelines before starting updated API containers.
3. **Secrets Management**: Inject `DATABASE_URL` and `JWT_SECRET` via environment variables or secret vaults (e.g., HashiCorp Vault, AWS Secrets Manager, GitHub Secrets).
4. **Log Forwarding**: Forward Docker stdout/stderr logs into central log aggregators (e.g. Datadog, Grafana Loki).

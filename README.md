# DevOps Portfolio — Infrastructure & Deployment

Production-ready static portfolio site deployed via CI/CD: Docker image built on push, pushed to GitHub Container Registry, deployed to a single host over SSH. Built to demonstrate real-world pipeline and container lifecycle for DevOps/Cloud Engineer roles.

**Owner:** Joseph Kano  
**Stack:** Static site, nginx:alpine, Docker, GitHub Actions, GHCR, Cloudflare (edge).

---

## Architecture

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                    Cloudflare (edge)                      │
                    │              DNS + proxy, TLS termination                 │
                    └───────────────────────────┬───────────────────────────────┘
                                                │ HTTPS
                                                ▼
┌──────────────┐     push      ┌──────────────┐     SSH + pull + run     ┌──────────────────┐
│   Developer  │ ────────────► │   GitHub     │ ──────────────────────► │  Home server     │
│   (local)    │               │   Actions    │     (after build)        │  Docker host     │
└──────────────┘               └──────┬───────┘                          │  :80 → container │
                                      │                                   └──────────────────┘
                                      │ build & push
                                      ▼
                               ┌──────────────┐
                               │  GHCR        │
                               │  (container  │
                               │   registry)  │
                               └──────────────┘
```

- **Origin:** Single host (e.g. home server or VPS). No Kubernetes.
- **Container:** One nginx:alpine container serving static files from `/usr/share/nginx/html`.
- **Edge:** Cloudflare in front for DNS and HTTPS; origin can stay off public ports if using Cloudflare Tunnel.

---

## Deployment flow

1. Developer pushes to `main` on GitHub.
2. GitHub Actions runs the **Build and Deploy** workflow:
   - Checkout repo → Build Docker image → Tag with commit SHA and `latest` → Push to `ghcr.io/jkanodev/infra-self-hosted`.
   - SSH to the deploy host → Pull `latest` → Stop/remove existing container → Run new container (port 80).
3. Site is live behind Cloudflare. Updates are container replacement (pull → stop → run).

Manual deploy on the server (same result as the workflow’s deploy step):

```bash
./deploy.sh
```

Requires the server to be able to `docker pull` from GHCR (run `docker login ghcr.io` once with a GitHub PAT that has `read:packages`).

---

## CI/CD overview

| Stage        | Where        | What happens                                      |
|-------------|--------------|----------------------------------------------------|
| Build       | GitHub Actions | `docker build` from repo root; image includes `src/` and nginx config. |
| Tag         | GitHub Actions | `latest` and commit SHA.                           |
| Push        | GitHub Actions | Image pushed to GHCR.                              |
| Deploy      | GitHub Actions | SSH to server, run pull + stop + run (see `deploy.sh`). |

Secrets (configure in GitHub repo → Settings → Secrets and variables → Actions):

- `DEPLOY_HOST` — Server hostname or IP.
- `DEPLOY_USER` — SSH user.
- `SSH_PRIVATE_KEY` — Private key for SSH (full key, including `-----BEGIN ... -----`).

The server must have Docker installed and be logged in to GHCR so `docker pull` succeeds. For private images, use a GitHub PAT with `read:packages` and run `docker login ghcr.io` on the server once.

---

## How to reproduce locally

```bash
git clone https://github.com/jkanodev/infra-self-hosted.git
cd infra-self-hosted
docker build -t portfolio-local .
docker run -p 80:80 portfolio-local
```

Open http://localhost. Health check: http://localhost/health.

With Docker Compose:

```bash
docker compose up --build -d
```

---

## Production considerations

- **Secrets:** No secrets in the repo. GitHub Actions uses repository secrets; the server uses local Docker login for GHCR.
- **Zero-downtime:** Current flow is stop-then-run. For true zero-downtime you’d add a reverse proxy (e.g. nginx or Caddy on the host) and swap containers behind it, or use rolling strategies if you scale out.
- **Health:** The container exposes `/health` (nginx returns 200). Docker healthcheck runs inside the container; you can also hit `https://your-domain/health` from outside (e.g. monitoring).
- **SSL:** Handled at Cloudflare; origin can be HTTP on localhost or over a tunnel.

---

## Future improvements

- Reverse proxy on the host (nginx/Caddy) so container can be replaced without dropping connections.
- Optional Prometheus metrics endpoint and basic dashboards.
- Staging environment (e.g. deploy to a second host or tag) before production.
- Image signing (e.g. cosign) and stricter supply-chain checks in the pipeline.

---

## Kubernetes Operational Labs

This repository documents structured, hands-on Kubernetes execution across multi-node cluster scenarios.

Focus areas:

- Scheduler behavior under replica load
- Node drain and workload migration validation
- ReplicaSet reconciliation under failure conditions
- Deterministic placement using nodeSelector
- Runtime configuration injection using ConfigMaps
- Secret-based configuration handling
- Transition from legacy environment-coupled builds to immutable image strategy

All experiments were performed on a multi-node Kind cluster with direct runtime validation using kubectl and container inspection. A detailed execution summary is available on the [portfolio site](https://j-kano.site/kubernetes.html) under **Kubernetes & DevOps Engineering**.

---

## Repository structure

```
infra-self-hosted/
├── .github/workflows/
│   ├── ci.yml          # Validation (structure, docs)
│   └── deploy.yml      # Build → GHCR → SSH deploy
├── src/                # Static site (web root in container)
│   ├── index.html      # Portfolio homepage
│   ├── kubernetes.html # Kubernetes & DevOps Engineering execution summary
│   ├── snake.html
│   ├── game.html
│   └── devops/
├── infra/
│   └── nginx.default.conf   # Nginx config (includes /health)
├── Dockerfile
├── docker-compose.yml
├── deploy.sh           # Server-side pull + restart
├── README.md
├── docs/
└── templates/
```

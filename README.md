# Self-Hosted Infrastructure (DevOps)

## What this is
A self-hosted, security-first web stack running on bare metal with Docker and Cloudflare Tunnel.

Goal
- Serve a public website over HTTPS
- Do not expose the origin machine IP
- Do not use router port-forwarding
- Keep everything automation-ready for CI and repeatable setup

## Architecture
Traffic flow
Client
→ Cloudflare Edge HTTPS
→ Cloudflare Tunnel outbound only
→ NGINX container
→ Static site files

Core components
- Ubuntu 24.04 on bare metal
- Docker
- NGINX in Docker
- Cloudflare Tunnel for public ingress
- TLS terminated at Cloudflare edge
- UFW firewall deny incoming allow outgoing
- Optional Tailscale for private admin access

## Security model
- No inbound ports opened on the router
- No public SSH
- Origin IP not published in DNS
- Cloudflared establishes outbound encrypted connections to Cloudflare
- Host firewall enabled with deny by default inbound policy

Validation checks performed
- ufw status verbose
- ss -tulpen
- curl to confirm HTTPS served by Cloudflare
- DNS checks to confirm traffic is proxied

## Repository structure
This repo keeps configs and docs sanitized, using placeholders instead of real domains, IPs, hostnames, or secrets.

```text
infra-self-hosted/
├── docs/
│   └── ARCHITECTURE.md
├── templates/
│   └── nginx.conf
├── nginx/
│   └── site/
│       └── index.html
├── scripts/
├── .github/
│   └── workflows/
└── README.md

## Deployment

This project uses a pull-based deployment model.

The server runs NGINX in Docker with the site directory mounted read-only.  
Updates are deployed by pulling the latest changes from GitHub.

To deploy updates on the server:

```bash
./deploy
# trigger

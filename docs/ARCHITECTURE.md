# Architecture Overview

## Goal
Expose a public HTTPS website from a self-hosted machine **without exposing the origin IP or opening router ports**.

## High-Level Flow
User → Cloudflare Edge (HTTPS) → Cloudflare Tunnel → NGINX (Docker) → Static site

## Components
- OS: Ubuntu 24.04 (bare metal)
- Container runtime: Docker
- Web server: NGINX (containerized)
- Public ingress: Cloudflare Tunnel (Zero Trust)
- TLS: Cloudflare edge termination
- Firewall: UFW (deny incoming, allow outgoing)

## Security Decisions
- No router port-forwarding
- No public SSH
- No origin IP in DNS
- Outbound-only encrypted tunnel
- Host firewall enabled

## Validation
- Local health checks via curl
- Port inspection via ss
- DNS verification confirms Cloudflare proxy
- HTTPS served from Cloudflare edge

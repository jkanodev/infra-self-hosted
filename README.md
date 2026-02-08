# Self-Hosted Infrastructure (DevOps)

## Overview
This repository documents a self-hosted infrastructure project built on bare-metal hardware to simulate real-world DevOps and production operations.

The goal of this project is to demonstrate how to safely expose public web services **without exposing a home network**, using modern tooling, security-first decisions, and automation-ready design.

This is not a tutorial repo — it is a working system that I built, tested, and validated from the terminal.

---

## Architecture Summary
- Host OS: Ubuntu 24.04 (bare metal PC)
- Containerization: Docker
- Web Server: NGINX (Docker container)
- Public Access: Cloudflare Tunnel (Zero Trust)
- TLS / HTTPS: Cloudflare edge termination
- Firewall: UFW (deny-by-default)
- Optional private access: Tailscale

**Key design choice:**  
No router port-forwarding, no public SSH, no exposed home IP address.

All inbound traffic terminates at Cloudflare and is forwarded to the host via an outbound-only encrypted tunnel.

---

## What I Built
- Installed and hardened Ubuntu on a dedicated machine
- Installed Docker and resolved permission and socket issues
- Deployed NGINX in Docker and verified local service health
- Configured a named Cloudflare Tunnel for a real domain
- Removed direct DNS A records pointing to my home IP
- Served the site fully over HTTPS via Cloudflare edge
- Enabled and verified UFW firewall (deny incoming, allow outgoing)
- Verified listening services and exposure using terminal tools
- Confirmed public traffic never reaches the origin directly

---

## Security Model
- No inbound ports exposed on the router
- No public SSH or admin interfaces
- Firewall enforced at host level
- Encrypted outbound-only tunnel to Cloudflare
- Origin IP never visible to clients

Validation performed using:
- ufw status verbose
- ss -tulpen
- curl and DNS checks

---

## Why This Matters
This project demonstrates:
- Practical DevOps fundamentals
- Secure networking decisions
- Cloudflare Zero Trust usage
- Dockerized service management
- Comfort operating entirely from the Linux terminal
- Debugging real infrastructure issues under constraints

This setup mirrors how modern homelabs and small production systems are deployed safely.

---

## Current Status
- Public HTTPS site live behind Cloudflare Tunnel
- Infrastructure stable and secured
- Ready for CI/CD automation

---

## Planned Enhancements
- GitHub Actions deployment pipeline
- Read-only volume mounts for web content
- Application hosting behind the same tunnel
- Basic monitoring and log review
# Self-Hosted Infrastructure (DevOps)\n\nThis repository documents a secure self-hosted infrastructure project using Docker, NGINX, and Cloudflare Tunnel.\n\nThe goal is to demonstrate real-world DevOps practices, security-first networking, and production-style workflows on bare metal.

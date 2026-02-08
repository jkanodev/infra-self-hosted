# Case Study: Self-Hosted Secure Web Infrastructure

## Background
The goal of this project was to expose a public HTTPS website from a self-hosted machine while minimizing risk to the origin system and home network.

Rather than using a VPS, the system was built on bare-metal hardware to simulate real-world constraints such as limited physical access, ISP networking limitations, and security concerns around public exposure.

From the start, security and observability were prioritized over convenience.

---

## Initial Goals and Constraints
- Serve a public website over HTTPS
- Avoid router port-forwarding
- Avoid exposing the origin IP address
- Use containerized services
- Operate primarily from the Linux terminal
- Design something that could later support CI/CD

---

## Early Challenges

### Docker Permissions and Host Setup
After installing Docker, basic commands failed due to permission issues accessing the Docker socket.

Rather than defaulting to running everything with sudo, user and group permissions were corrected so Docker could be used safely as a non-root user. This aligned with least-privilege practices.

### Service Conflicts
At one point, multiple services attempted to bind to the same ports, leading to failures during restarts and certificate attempts.

This reinforced the importance of understanding which layer (host vs container vs proxy) should own TLS and port binding responsibilities.

---

## Public Exposure and Security Concerns
Initial attempts at public access raised concerns about exposing the home network directly.

Port-forwarding was intentionally avoided after evaluating the risks, especially for long-lived services.

This led to the decision to use Cloudflare Tunnel instead of direct ingress.

---

## Cloudflare Tunnel Iteration
Several early tunnel attempts failed due to mixing quick tunnels, named tunnels, and DNS records pointing directly to the origin.

Key fixes included:
- Switching exclusively to a named tunnel
- Removing all DNS A records pointing to the home IP
- Letting Cloudflare handle TLS termination at the edge
- Ensuring the tunnel operated via outbound-only encrypted connections

Once these changes were made, HTTPS traffic flowed reliably without exposing the origin.

---

## Firewall and Validation
With public access working, the next focus was validating security at the host level.

Actions taken:
- Enabled UFW with deny-by-default inbound policy
- Verified listening services using ss
- Confirmed no public administrative services were reachable
- Verified HTTPS responses were served by Cloudflare, not the origin

These checks provided confidence that the system was safe to operate continuously.

---

## Final Architecture Outcome
The final system:
- Serves public HTTPS traffic securely
- Does not expose the origin IP
- Does not rely on inbound ports
- Uses containerized services
- Can be extended with automation and CI/CD

This mirrors how many modern homelabs and small production systems are deployed using zero-trust principles.

---

## Lessons Learned
- Clear separation of responsibilities (edge vs origin) prevents complexity
- Security-first decisions simplify long-term maintenance
- Documentation and validation matter as much as implementation
- Outbound-only models significantly reduce attack surface

---

## Next Improvements
- Add automated deployment via GitHub Actions
- Mount site content read-only into containers
- Add lightweight monitoring and logging

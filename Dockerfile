# Simple, production-friendly static site image
FROM nginx:alpine

# Remove default nginx html
RUN rm -rf /usr/share/nginx/html/*

# Copy your site
COPY nginx/site/ /usr/share/nginx/html/

# Basic healthcheck (nginx serves on 80)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

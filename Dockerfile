# Multi-stage: final image only (static site, no build step)
FROM nginx:alpine AS runtime

RUN apk add --no-cache wget

# Remove default config and use our own (includes /health)
RUN rm -f /etc/nginx/conf.d/default.conf
COPY infra/nginx.default.conf /etc/nginx/conf.d/default.conf

# Static site content
COPY src/ /usr/share/nginx/html/

# Non-root user for nginx (alpine already runs as nginx)
# Ensure readable
RUN chown -R nginx:nginx /usr/share/nginx/html && chmod -R 755 /usr/share/nginx/html

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

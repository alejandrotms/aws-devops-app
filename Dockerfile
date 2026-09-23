# ── Stage 1: install dependencies ────────────────────────────
FROM node:18-alpine AS deps
WORKDIR /app

# Copy ONLY the dependency manifests first.
# This layer is cached — it's only rebuilt when package files change,
# not when you edit application code.
COPY package*.json ./

# Reproducible install of production dependencies only
RUN npm ci --omit=dev

# ── Stage 2: production image ────────────────────────────────
FROM node:18-alpine
WORKDIR /app

ENV NODE_ENV=production

# Bring over ONLY node_modules from stage 1.
# npm cache and anything else in the deps stage stays out of the final image.
COPY --from=deps /app/node_modules ./node_modules

# Copy application code LAST — code changes don't invalidate the deps layers
COPY . .

# Run as the non-root "node" user
USER node

EXPOSE 3000

# Docker-level health check using the app's /health endpoint
# (alpine includes wget — no need to install curl)
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "index.js"]
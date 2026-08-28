# syntax=docker/dockerfile:1.7

# ─────────────────────────────────────────────────────────────────────────────
# indus-hydraulics — production image
#
# Builder and runner share ONE base image on purpose. Two things in this app are
# compiled against the platform and fail at runtime if they were built against a
# different one:
#
#   * the Prisma query engine — `binaryTargets` names `debian-openssl-3.0.x`,
#     which is what bookworm provides. A mismatch builds cleanly and throws at
#     the first query.
#   * sharp — every image on this site is a remote Supabase object rendered
#     through /_next/image, so a missing or wrong-arch binary means an imageless
#     site rather than an error.
#
# bookworm-slim also ships full ICU, which `Asia/Dubai` formatting needs; a
# small-ICU runtime silently formats in UTC.
# ─────────────────────────────────────────────────────────────────────────────
ARG NODE_VERSION=22-bookworm-slim

# ── deps ─────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Manifests first, so a source-only change reuses the install layer.
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json apps/web/
COPY packages/db/package.json packages/db/
COPY packages/domain/package.json packages/domain/
COPY packages/ui/package.json packages/ui/
COPY packages/email/package.json packages/email/
COPY packages/pdf/package.json packages/pdf/

# `--ignore-scripts` because packages/db's postinstall runs `prisma generate`,
# which needs the schema — not copied yet. Generated explicitly in the next stage.
RUN pnpm install --frozen-lockfile --ignore-scripts

# ── build ────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages ./packages
COPY . .

RUN pnpm --filter @indus/db exec prisma generate

# NEXT_PUBLIC_* are inlined into the client bundle at build time, so they are
# build args rather than runtime env. Getting one wrong here freezes it into
# every emailed link until the next build — the CI job greps the output for
# `localhost:3000` for exactly this reason.
ARG NEXT_PUBLIC_BASE_URL=https://indushydraulics.com
ARG NEXT_PUBLIC_SUPABASE_URL
ARG APP_ENV=production
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL} \
    NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL} \
    APP_ENV=${APP_ENV} \
    NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# Secrets are MOUNTED, never ARG or ENV — an ARG is readable in `docker history`
# for anyone who can pull the image.
#
# The build genuinely needs all of these, which the first CI run proved rather
# than the docs: route modules are evaluated while collecting page data, so the
# auth config is constructed at import time and a missing STAFF_AUTH_SECRET
# fails the build. The database is needed because the build prerenders from the
# catalogue.
RUN --mount=type=secret,id=DATABASE_URL \
    --mount=type=secret,id=DIRECT_URL \
    --mount=type=secret,id=CUSTOMER_AUTH_SECRET \
    --mount=type=secret,id=STAFF_AUTH_SECRET \
    --mount=type=secret,id=SUPABASE_SERVICE_ROLE_KEY \
    DATABASE_URL="$(cat /run/secrets/DATABASE_URL)" \
    DIRECT_URL="$(cat /run/secrets/DIRECT_URL)" \
    CUSTOMER_AUTH_SECRET="$(cat /run/secrets/CUSTOMER_AUTH_SECRET)" \
    STAFF_AUTH_SECRET="$(cat /run/secrets/STAFF_AUTH_SECRET)" \
    SUPABASE_SERVICE_ROLE_KEY="$(cat /run/secrets/SUPABASE_SERVICE_ROLE_KEY)" \
    pnpm build

# ── runner ───────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    TZ=Asia/Dubai

# curl is for the container healthcheck. Nothing else is added.
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl \
 && rm -rf /var/lib/apt/lists/*

RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs

# `standalone` traces the server and its dependencies, resolving pnpm's symlinks
# on the way — which is what makes this runnable on a machine with no store.
COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
# It deliberately does NOT copy these two. Without them the site serves HTML
# with no CSS and no images, which reads as a styling bug rather than a
# packaging one.
COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# The ISR and image caches are mounted here from a persistent volume. Left
# inside the image, every release would ship an empty cache — reproducing by
# hand the per-deploy cache wipe that is a large part of why we are leaving
# Vercel. Owned by the app user so the running process can write to it.
RUN mkdir -p /app/apps/web/.next/cache && chown -R nextjs:nodejs /app/apps/web/.next/cache
VOLUME ["/app/apps/web/.next/cache"]

USER nextjs
EXPOSE 3000

# Liveness only — it touches nothing. Pointing this at /api/health (which
# queries the database) restarts a healthy container whenever Supabase blinks.
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://127.0.0.1:3000/api/health/live || exit 1

CMD ["node", "apps/web/server.js"]

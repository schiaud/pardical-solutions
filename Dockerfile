# Pardical web (pardical.com + yard websites + admin). Next.js standalone server, SQLite on a mounted disk.
# node:sqlite needs Node >= 22.13; Node 24 is the current LTS.

FROM node:24-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:24-bookworm-slim AS run
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    DATABASE_PATH=/data/app.db
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
# Shipping-cost tables read at runtime (not traced into the standalone bundle).
COPY --from=build /app/data/shipping_categories.json /app/data/shipping_history.json ./data/
RUN mkdir -p /data
EXPOSE 3000
CMD ["sh", "-c", "HOSTNAME=0.0.0.0 exec node server.js"]

FROM node:alpine as build

WORKDIR /app

COPY . .

RUN yarn install --frozen-lockfile --non-interactive --production --link-duplicates

ENV PORT=8080 \
  HEALTHCHECK_PATH=/retry-proxy/healthcheck \
  NODE_ENV=production

HEALTHCHECK CMD ["node", "healthcheck.js"]

CMD ["node", "index.js"]

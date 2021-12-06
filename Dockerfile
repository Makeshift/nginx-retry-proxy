FROM node:alpine AS build

WORKDIR /app

COPY . .

RUN npm ci

FROM gcr.io/distroless/nodejs:16

COPY --from=build /app /app

WORKDIR /app

CMD ["index.js"]

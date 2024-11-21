FROM node:18-alpine AS builder

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --production=false
COPY . .
RUN yarn build

FROM node:18-alpine

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock
COPY --from=builder /app/.env ./.env
RUN yarn install --production

ENV NODE_ENV=production
ENV CERT_KEY_PATH=/certs/server.key
ENV CERT_CERT_PATH=/certs/server.crt

EXPOSE 3001

CMD ["node", "dist/index.js"]

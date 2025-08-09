FROM node:20.19.4-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM node:20.19.4-slim
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock
COPY --from=builder /app/src/json_data ./src/json_data
RUN yarn install --production

ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/index.js"]

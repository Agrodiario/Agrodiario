# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json yarn.lock ./
COPY packages/backend/package.json ./packages/backend/
RUN yarn install --frozen-lockfile

COPY packages/backend ./packages/backend
RUN yarn workspace @agrodiario/backend build

# Production stage
FROM node:20-alpine
WORKDIR /app

COPY package.json yarn.lock ./
COPY packages/backend/package.json ./packages/backend/
RUN yarn install --frozen-lockfile --production && yarn cache clean

COPY --from=builder /app/packages/backend/dist ./dist

RUN mkdir -p uploads
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/main.js"]

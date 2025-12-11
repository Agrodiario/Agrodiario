# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json yarn.lock ./
COPY packages/client/package.json ./packages/client/
RUN yarn install --frozen-lockfile

COPY packages/client ./packages/client

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app/packages/client
RUN yarn build

# Production stage
FROM nginx:alpine

# Copy nginx config template
COPY --from=builder /app/packages/client/nginx.conf /etc/nginx/templates/default.conf.template

# Copy built static files
COPY --from=builder /app/packages/client/dist /usr/share/nginx/html

# Railway provides PORT env var - default to 80 for local testing
ENV PORT=80
EXPOSE 80

# nginx:alpine auto-runs envsubst on /etc/nginx/templates/*.template files
CMD ["nginx", "-g", "daemon off;"]

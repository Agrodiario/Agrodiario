# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files for workspace setup
COPY package.json yarn.lock ./
COPY packages/client/package.json ./packages/client/

# Install dependencies
RUN yarn install --frozen-lockfile --production=false

# Copy client source code (includes nginx.conf)
COPY packages/client ./packages/client

# Build arguments for environment variables
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the application
WORKDIR /app/packages/client
RUN yarn build

# Production stage - using nginx to serve static files
FROM nginx:alpine AS runner

# Copy custom nginx config from builder stage
COPY --from=builder /app/packages/client/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files
COPY --from=builder /app/packages/client/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

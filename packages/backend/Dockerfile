# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files for workspace setup
COPY package.json yarn.lock ./
COPY packages/backend/package.json ./packages/backend/

# Install all dependencies (including dev for build)
RUN yarn install --frozen-lockfile --production=false

# Copy backend source code
COPY packages/backend ./packages/backend

# Build the application
WORKDIR /app/packages/backend
RUN yarn build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy package files for production install
COPY package.json yarn.lock ./
COPY packages/backend/package.json ./packages/backend/

# Install production dependencies only (fresh install avoids symlink issues)
RUN yarn install --frozen-lockfile --production=true && \
    yarn cache clean

# Copy built application
COPY --from=builder /app/packages/backend/dist ./dist

# Copy startup script
COPY packages/backend/start.sh ./start.sh
RUN chmod +x ./start.sh

# Create uploads directory
RUN mkdir -p uploads

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start the application with migrations
CMD ["./start.sh"]

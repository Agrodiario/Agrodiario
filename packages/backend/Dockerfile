# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files for workspace setup
COPY package.json yarn.lock ./
COPY packages/backend/package.json ./packages/backend/

# Install dependencies
RUN yarn install --frozen-lockfile --production=false

# Copy backend source code
COPY packages/backend ./packages/backend

# Build the application
WORKDIR /app/packages/backend
RUN yarn build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy built application
COPY --from=builder /app/packages/backend/dist ./dist
COPY --from=builder /app/packages/backend/package.json ./

# Copy node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Create uploads directory
RUN mkdir -p uploads

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start the application
CMD ["node", "dist/main.js"]

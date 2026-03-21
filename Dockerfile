# Multi-stage build for HKN Budget Management System

# Stage 1: Build the React frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/client

# Copy client package files
COPY public/client/package*.json ./

# Install client dependencies
RUN npm install

# Copy client source code
COPY public/client/ ./

# Build the client
RUN npm run build

# Stage 2: Setup the backend and serve everything
FROM node:18-alpine

WORKDIR /app

# Install backend dependencies
COPY package*.json ./
RUN npm install --production

# Copy backend source code
COPY src/ ./src/
COPY scripts/ ./scripts/
COPY public/admin/ ./public/admin/

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/client/dist ./public/client/dist

# Copy environment file template
COPY .env.example .env

# Expose ports
# 4000 - Backend API
# Copy entrypoint script
COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh

# Expose the port the app runs on
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use the entrypoint script
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "run", "backend"]

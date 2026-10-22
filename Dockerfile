# ==========================================
# STAGE 1: Build the React Frontend
# ==========================================
FROM node:20-alpine AS frontend-builder

# Set working directory for frontend operations
WORKDIR /app/frontend

# Copy package files first to take advantage of Docker layer caching
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm install

# Copy all remaining frontend source code
COPY frontend/ ./

# Build the production React static assets (typically outputs to /dist or /build)
RUN npm run build


# ==========================================
# STAGE 2: Set up and run Express Backend
# ==========================================
FROM node:20-alpine AS production

# Set working directory for backend execution
WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./backend/

# Install backend dependencies (production dependencies only)
WORKDIR /app/backend
RUN npm install --only=production

# Copy backend source files
COPY backend/ ./

# Copy compiled frontend assets from Stage 1 into backend's public folder
COPY --from=frontend-builder /app/frontend/dist ./public

# Expose the application port
EXPOSE 5000

# Set environment variable for production
ENV NODE_ENV=production

# Start the application using your backend entry file
CMD ["node", "src/index.js"]
# # ==========================================
# # STAGE 1: Build the React Frontend
# # ==========================================
# FROM node:20-alpine AS frontend-builder

# # Set working directory for frontend operations
# WORKDIR /app/frontend

# # Copy package files first to take advantage of Docker layer caching
# COPY frontend/package*.json ./

# # Install frontend dependencies
# RUN npm install

# # Copy all remaining frontend source code
# COPY frontend/ ./

# # Build the production React static assets (typically outputs to /dist or /build)
# RUN npm run build


# # ==========================================
# # STAGE 2: Set up and run Express Backend
# # ==========================================
# FROM node:20-alpine AS production

# # Set working directory for backend execution
# WORKDIR /app

# # Copy backend package files
# COPY backend/package*.json ./backend/

# # Install backend dependencies (production dependencies only)
# WORKDIR /app/backend
# RUN npm install --only=production

# # Copy backend source files
# COPY backend/ ./

# # Copy compiled frontend assets from Stage 1 into backend's public folder
# COPY --from=frontend-builder /app/frontend/dist ./public

# # Expose the application port
# EXPOSE 5000

# # Set environment variable for production
# ENV NODE_ENV=production

# # Start the application using your backend entry file
# CMD ["node", "src/index.js"]

# Monolith: Vite frontend + Express API. Build from repo root.

# --- Stage 1: build the SPA (Vite) ---
# Produces static HTML/JS/CSS under frontend/dist.
FROM node:22-bookworm-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install --no-audit --no-fund --legacy-peer-deps
COPY frontend/ ./
# Empty = browser calls /api on the same host as the page.
ENV VITE_API_URL=
# Public Clerk key is embedded in client JS.
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
RUN npm run build

# --- Stage 2: build the API bundle ---
# This backend is ESM JavaScript, so npm run build copies src/ to dist/.
FROM node:22-bookworm-slim AS backend-build
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm install --no-audit --no-fund
COPY backend/ ./
RUN npm run build

# --- Stage 3: runtime image (only prod deps + built assets) ---
# Express serves API routes and static files from public/.
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

COPY backend/package.json backend/package-lock.json ./
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force

COPY --from=backend-build /app/dist ./dist
COPY --from=frontend-build /app/frontend/dist ./public

EXPOSE 3001
USER node

CMD ["node", "dist/index.js"]
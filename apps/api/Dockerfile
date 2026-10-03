FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace configurations
COPY package*.json ./
COPY packages/database ./packages/database
COPY apps/api ./apps/api

# Install dependencies and build
RUN npm install
RUN npm run generate --workspace=@hospitalos/database || true
RUN npm run build --workspace=@hospitalos/api

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

# Copy built artifacts
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/database ./packages/database
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package*.json ./apps/api/

EXPOSE 4000

CMD ["node", "apps/api/dist/main.js"]

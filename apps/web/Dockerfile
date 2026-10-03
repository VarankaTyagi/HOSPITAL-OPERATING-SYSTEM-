FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY packages/database ./packages/database
COPY apps/web ./apps/web

RUN npm install
RUN npm run build --workspace=@hospitalos/web

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/package*.json ./apps/web/

EXPOSE 3000

CMD ["npm", "start", "--workspace=@hospitalos/web"]

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/vite.config.ts ./
COPY --from=builder /app/tsconfig.json ./

ENV NODE_ENV=production
ENV PORT=3002

EXPOSE 3002

# Using vite preview to serve the build
CMD ["npm", "run", "preview", "--", "--port", "3002", "--host"]

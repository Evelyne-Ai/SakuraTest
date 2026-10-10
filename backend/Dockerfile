# Build context: root repo (lihat docker-compose.yml)
FROM node:20-alpine
WORKDIR /app
COPY shared ./shared
COPY backend/package.json ./backend/package.json
RUN cd backend && npm install --omit=dev
COPY backend ./backend
ENV NODE_ENV=production PORT=4000
EXPOSE 4000
RUN mkdir -p /data && chown node:node /data
USER node
CMD ["node", "backend/src/server.js"]

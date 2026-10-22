# Centro de mando: construye la pantalla y la sirve junto al servidor.
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine
RUN apk add --no-cache git openssh-client
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/package.json ./
USER node
EXPOSE 3000
CMD ["node", "server/index.mjs"]

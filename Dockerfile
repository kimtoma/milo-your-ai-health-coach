FROM node:22-alpine AS build
WORKDIR /build
COPY cloudrun/package.json cloudrun/package-lock.json ./
RUN npm ci
COPY cloudrun/ ./
RUN npm run build

FROM node:22-alpine

WORKDIR /usr/src/app

COPY --from=build /build/public ./public
COPY cloudrun/server.mjs ./server.mjs

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.mjs"]

FROM node:22-alpine

WORKDIR /usr/src/app

COPY cloudrun/ ./

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.mjs"]

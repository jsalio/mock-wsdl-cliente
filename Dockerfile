FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000

# pnpm se toma de "packageManager" en package.json (corepack)
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY server.js NovoSignWSDL.wsdl ./

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT}/health || exit 1

CMD ["node", "server.js"]

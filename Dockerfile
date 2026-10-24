# Estágio 1: Dependências e Build
FROM node:20-slim AS builder

# Instala openssl e dependências necessárias para o Prisma no Debian/Slim
RUN apt-get update && apt-get install -y openssl libssl-dev

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm install

COPY . .

RUN npx prisma generate
RUN npm run build

# ---
# Estágio 2: Produção
FROM node:20-slim

# Instala openssl na imagem final também
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/prisma ./prisma

EXPOSE 3000

CMD ["npm", "run", "start:prod"]

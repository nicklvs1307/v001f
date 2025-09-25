# Estágio 1: Build da aplicação Node.js
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# O contexto de build agora é a pasta 'backend', então não precisamos mais do prefixo 'backend/'.
COPY package*.json ./
RUN npm install --production

COPY . .
COPY scripts/wait-for-it.sh ./scripts/wait-for-it.sh
RUN chmod +x ./scripts/wait-for-it.sh

# Se houver um passo de build para o backend (ex: TypeScript), adicione aqui.
# Exemplo: RUN npm run build

# Estágio 2: Imagem final
FROM node:18-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app .

# Copia o entrypoint.sh
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

EXPOSE 5000

CMD ["node", "src/server.js"]

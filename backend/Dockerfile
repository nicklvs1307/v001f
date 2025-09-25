# Estágio 1: Builder - Instala dependências e copia o código
FROM node:18-slim AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .

# Estágio 2: Production - Copia os artefatos do builder e configura para produção
FROM node:18-slim
WORKDIR /usr/src/app

# Cria um usuário não-root para segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 feedeliza
USER feedeliza

COPY --from=builder /usr/src/app .

# Expõe a porta que a aplicação vai usar
EXPOSE 5000

# Adiciona um Healthcheck para o Docker Swarm monitorar a saúde do container
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD [ "node", "-e", "require('http').get('http://localhost:5000/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))" ]

# Comando para iniciar a aplicação (será sobrescrito no stack.yml para incluir o wait-for-it.sh)
CMD ["node", "src/server.js"]
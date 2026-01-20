# Estágio 1: Builder - Instala dependências e copia o código
FROM node:18-slim AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .

# Dá permissão de execução para o script de wait-for-it
RUN chmod +x /usr/src/app/scripts/wait-for-it.sh

# Estágio 2: Production - Copia os artefatos do builder e configura para produção
FROM node:18-slim
WORKDIR /usr/src/app

# Cria um usuário não-root para segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 feedeliza

# Instala o netcat, necessário para o script wait-for-it.sh
# A imagem slim não vem com netcat, então precisamos instalar manualmente.
# Trocamos para o usuário root para instalar o pacote e depois voltamos para o usuário não-root.
USER root
RUN apt-get update && apt-get install -y netcat-openbsd curl && rm -rf /var/lib/apt/lists/*
USER feedeliza

COPY --from=builder /usr/src/app .

# Cria o diretório de uploads e define as permissões
USER root
RUN mkdir -p uploads/logos
RUN chown -R feedeliza:nodejs uploads
USER feedeliza

# Expõe a porta que a aplicação vai usar
EXPOSE 5000

# Adiciona um Healthcheck para o Docker Swarm monitorar a saúde do container
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD [ "node", "-e", "require('http').get('http://localhost:5000/api/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))" ]

# Comando para iniciar a aplicação (será sobrescrito no stack.yml para incluir o wait-for-it.sh)
CMD ["node", "src/server.js"]
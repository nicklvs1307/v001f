# Estágio 1: Build - Compila o React App
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

COPY . .

# Argumento para injetar a URL da API durante o build
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

# Estágio 2: Production - Serve os arquivos estáticos com Nginx
FROM nginx:1.25-alpine

# Copia a configuração personalizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos buildados do estágio anterior
COPY --from=build /app/build /usr/share/nginx/html

# Instala o wget, necessário para o Healthcheck
RUN apk --no-cache add wget

# Expõe a porta 80
EXPOSE 80

# Healthcheck para o Nginx
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
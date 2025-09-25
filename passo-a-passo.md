# Guia de Deploy na VPS com Docker Swarm e Portainer

Este guia descreve os passos para fazer o build e o deploy da sua aplicação em uma VPS Linux utilizando Docker, Docker Swarm e Portainer.

---

## 1. Preparação do Ambiente (Executar na sua VPS Linux)

Estes comandos preparam sua VPS para receber a aplicação.

### 1.1. Instale Git e Docker
Se ainda não tiver, instale o Git e o Docker:
```bash
sudo apt-get update
sudo apt-get install -y git docker.io
```

### 1.2. Inicie o Docker Swarm
Isso transforma seu Docker em um "manager" de um cluster (mesmo que de um nó só), o que é necessário para usar Stacks e Secrets.
```bash
sudo docker swarm init
```

### 1.3. Crie a Rede para o Traefik
O Traefik (que gerencia os domínios) precisa de uma rede do tipo `overlay` para se comunicar com os containers.
```bash
sudo docker network create --driver=overlay traefik-public
```

### 1.4. Crie os Docker Secrets
Sua aplicação usa "secrets" para guardar informações sensíveis. Crie-os no Docker Swarm. **Substitua `SEU_VALOR_SECRETO` pelos valores reais.**

```bash
# Segredos do Banco de Dados
echo "loyalfood" | sudo docker secret create postgres_db -
echo "postgres" | sudo docker secret create postgres_user -
echo "SEU_VALOR_SECRETO_PARA_SENHA_DO_DB" | sudo docker secret create postgres_password -

# Segredo para o JWT (JSON Web Token)
echo "SEU_VALOR_SECRETO_PARA_JWT" | sudo docker secret create jwt_secret -
```
> **Atenção:** Os valores de `postgres_db` e `postgres_user` estão no seu `docker-compose.yml`. A senha do banco e o segredo do JWT devem ser valores seguros que você escolher.

---

## 2. Build e Upload das Imagens (Executar na sua Máquina Local)

Agora, vamos construir as imagens do frontend e backend e enviá-las para um registro, como o Docker Hub.

### 2.1. Faça login no seu Docker Registry
Substitua `SEU_USUARIO_DOCKER` pelo seu nome de usuário no Docker Hub (ou outro registro).
```bash
docker login -u SEU_USUARIO_DOCKER
```

### 2.2. Faça o Build das Imagens
Estes comandos criam as imagens a partir dos seus Dockerfiles, já com a tag correta para o seu registro.

**Backend:**
```bash
docker build -t SEU_USUARIO_DOCKER/loyalfood-backend:latest ./backend
```

**Frontend:**
```bash
docker build -t SEU_USUARIO_DOCKER/loyalfood-frontend:latest ./frontend
```

### 2.3. Envie as Imagens para o Registry
Agora, envie as imagens que você acabou de criar.

**Backend:**
```bash
docker push SEU_USUARIO_DOCKER/loyalfood-backend:latest
```

**Frontend:**
```bash
docker push SEU_USUARIO_DOCKER/loyalfood-frontend:latest
```

---

## 3. Deploy da Stack com Portainer (Acessando o Portainer da sua VPS)

Com as imagens no registry e o ambiente preparado, vamos usar o Portainer para subir a aplicação.

1.  **Acesse o Portainer** no seu navegador.
2.  No menu à esquerda, vá em **Stacks**.
3.  Clique em **+ Add stack**.
4.  Dê um nome para a sua stack (ex: `loyalfood`).
5.  Selecione **Web editor** como método de build.
6.  **COPIE** o conteúdo do seu arquivo `docker-compose.yml` local.
7.  **COLE** o conteúdo no editor web do Portainer.
8.  **IMPORTANTE: Modifique o conteúdo colado no Portainer!**
    Você precisa alterar as seções `image` para que o Swarm puxe as imagens do seu registro. Altere as seguintes linhas:

    No serviço `migrations`:
    *   **DE:** `image: loyalfood-backend:latest`
    *   **PARA:** `image: SEU_USUARIO_DOCKER/loyalfood-backend:latest`

    No serviço `backend`:
    *   **DE:** `image: loyalfood-backend:latest`
    *   **PARA:** `image: SEU_USUARIO_DOCKER/loyalfood-backend:latest`

    No serviço `frontend`:
    *   **DE:** `image: loyalfood-frontend:latest`
    *   **PARA:** `image: SEU_USUARIO_DOCKER/loyalfood-frontend:latest`

9.  Após fazer as 3 alterações acima no editor do Portainer, role para baixo e clique em **Deploy the stack**.

O Portainer irá baixar as imagens do seu registro e iniciar todos os serviços conforme configurado.

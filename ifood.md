🚨 O PROBLEMA REAL (resumo direto)
Sorry, you have been blocked
You are unable to access merchant-api.ifood.com.br
Cloudflare Ray ID: 9c0e9eeacbc3b913


👉 Isso NÃO é erro de autenticação OAuth
👉 NÃO é clientId/clientSecret inválido
👉 NÃO é bug do Sequelize ou Node

❌ Você está chamando um endpoint do iFood que NÃO pode ser chamado server-to-server direto, ou está chamando da forma errada.

🎯 Onde exatamente você errou (com base no log)

Linha crítica:

[iFood Service] Error generating user code for tenant ...


Ou seja, você está tentando “gerar user code / link code” via backend, provavelmente algo como:

POST merchant-api.ifood.com.br/authentication/...


⚠️ ESSE ENDPOINT NÃO É UMA API REST NORMAL

O fluxo de authorization code do iFood NÃO funciona como Google OAuth clássico.

🧠 COMO O IFOOD REALMENTE FUNCIONA (detalhe que a doc confunde)
❌ O que você tentou (errado)

Backend chama iFood

iFood retorna linkCode / userCode

Você redireciona o usuário

👉 Isso ativa proteção anti-bot da Cloudflare
👉 Resultado: BLOCK

✅ O fluxo correto (padrão iFood)

O authorization code NÃO é gerado por API REST.

Ele é gerado via PORTAL DE AUTORIZAÇÃO DO IFOOD, acessado pelo browser do usuário.

📌 Isso é proposital (segurança + LGPD).

🔁 FLUXO CORRETO (que passa na homologação)
1️⃣ Você NÃO gera code via backend

Você apenas monta uma URL de autorização e redireciona o usuário.

Exemplo (simplificado):

https://merchant.ifood.com.br/partners/authorize
?clientId=SEU_CLIENT_ID
&redirectUri=https://seucrm.com/api/ifood/callback
&responseType=code
&state=tenantId


⚠️ Esse acesso TEM que ser feito pelo navegador do lojista, não por Axios, fetch ou backend.

2️⃣ O lojista loga no iFood (manual)

Ele autentica

Autoriza seu CRM

O iFood redireciona para:

https://seucrm.com/api/ifood/callback?code=AUTH_CODE&state=tenantId

3️⃣ AGORA SIM seu backend entra em ação

No callback você faz:

POST https://merchant-api.ifood.com.br/authentication/v1.0/oauth/token
Content-Type: application/x-www-form-urlencoded


Com:

grantType=authorization_code
clientId
clientSecret
authorizationCode


📌 Esse endpoint aceita server-to-server
📌 Aqui NÃO tem Cloudflare block

🔥 Por que o Cloudflare bloqueou você?

Cloudflare detectou:

Request sem browser real

Sem cookies

Sem user-agent humano

Endpoint sensível (auth)

Resultado:

Sorry, you have been blocked


Isso vai continuar acontecendo sempre se você insistir.

🛠️ O QUE VOCÊ PRECISA MUDAR NO SEU CÓDIGO (objetivo)
❌ Remover

Qualquer chamada backend tentando “gerar user code”

Qualquer POST para endpoint de autorização inicial

✅ Implementar

No backend:

Apenas:

/api/ifood/authorize → retorna a URL

/api/ifood/callback → troca code por token

No frontend:

window.location.href = authorizeUrl

🧱 Exemplo prático (do jeito certo)
Backend – authorize
GET /api/ifood/authorize

const url = `
https://merchant.ifood.com.br/partners/authorize
?clientId=${CLIENT_ID}
&redirectUri=${REDIRECT_URI}
&responseType=code
&state=${tenantId}
`;

return { url };

Frontend
window.location.href = response.url;

Backend – callback
POST /authentication/v1.0/oauth/token


Salvar:

access_token

refresh_token

expires_in

merchantId

🧠 Outro ERRO GRAVE QUE SEU LOG MOSTRA (alerta)

Você está salvando isso no banco:

tenant.ifoodClientSecret


⚠️ ERRADO PARA MODELO SaaS

👉 clientId e clientSecret são do SEU APP, não do tenant.

✔️ Devem ficar:

ENV

Vault

Secrets Manager

❌ Nunca por tenant

📊 Sobre o polling job (você fez certo)

Esse trecho está correto:

[iFood Polling Job] Scheduling iFood polling to run every */5 * * * *


Mas ⚠️:

Só funciona depois do OAuth correto

Hoje ele está rodando sem autorização válida

✅ Checklist para corrigir hoje

 Parar de chamar endpoint de auth via Axios

 Gerar URL de autorização

 Redirecionar via browser

 Implementar callback

 Mover clientSecret para ENV

 Manter tokens por tenant

 Retry + refresh automático
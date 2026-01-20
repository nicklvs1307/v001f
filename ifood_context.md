# Contexto de Integração iFood - Feedeliza

Este documento resume as informações críticas obtidas da documentação oficial do iFood para o desenvolvimento do projeto.

## 1. Autenticação (Auth API)
**Base URL:** `https://authentication.ifood.com.br`

### Endpoints
*   **Obter Token:** `POST /oauth/token`
    *   **Grant Types:**
        *   `client_credentials`: Para integrações de loja única (Centralized).
        *   `authorization_code`: Para aplicativos multi-loja (Distributed).
        *   `refresh_token`: Para renovar tokens expirados.

### Fluxo (Resumo)
1.  Obter `access_token` via credenciais ou código de autorização.
2.  Token tem validade limitada (geralmente 6h).
3.  Usar `refresh_token` para obter novo acesso sem re-autenticar o usuário.

## 2. Pedidos (Order API)
**Base URL:** `https://merchant-api.ifood.com.br/order/v1.0`

### Fluxo de Eventos (Polling)
O iFood **não usa webhooks** para pedidos. O sistema deve buscar ativamente novos eventos.

*   **Polling:** `GET /events:polling`
    *   **Frequência Recomendada:** A cada 30 segundos.
    *   **Retorno:** Lista de eventos (ex: `PLACED`, `CONFIRMED`, `CANCELLED`).
*   **Acknowledge (ACK):** `POST /events/acknowledgment`
    *   **Obrigatório:** Após processar os eventos, deve-se enviar o ACK para removê-los da fila.
    *   **Payload:** Lista de IDs dos eventos processados.

## 3. Avaliações (Review API)
**Base URL:** `https://merchant-api.ifood.com.br/review/v2.0`

### Endpoints Principais
*   **Listar Avaliações:** `GET /merchants/{merchantId}/reviews`
*   **Responder Avaliação:** `POST /merchants/{merchantId}/reviews/{reviewId}/replies`
*   **Detalhes:** `GET /merchants/{merchantId}/reviews/{reviewId}`

### Regras de Negócio Importantes
*   **Prazo de Resposta:** 5 dias após a criação da avaliação.
*   **Tamanho da Resposta:** 10 a 300 caracteres.
*   **Status:** Só é possível responder avaliações com status `NOT_REPLIED`.
*   **Edição:** Permitida apenas 10 minutos após a resposta.

## 4. Referências Úteis
*   Portal do Desenvolvedor: https://developer.ifood.com.br
*   Status da API: https://status.ifood.com.br

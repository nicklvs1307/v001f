# PROJETO: Evolução Feedeliza CRM (High-Level Architecture)

Este documento detalha os requisitos técnicos, arquitetura de dados e estratégias de automação para transformar o Feedeliza em um CRM de elite, integrando o ERP, Cardápio Digital e Inteligência de Comportamento.

## 1. Arquitetura do "CRM Pixel" (Rastreamento de Comportamento)
O Pixel será o "olho" do sistema dentro do cardápio digital, capturando a intenção antes da conversão.
*   **Eventos de Monitoramento:**
    *   `page_view`: Identifica quais categorias ou pratos o cliente está explorando.
    *   `add_to_cart`: Captura itens de alto interesse que podem não ter sido finalizados.
    *   `cart_abandonment`: Gatilho crucial para automação de recuperação via WhatsApp.
    *   `initiate_checkout`: Identifica o momento de decisão final.
*   **Estratégia de Identificação:**
    *   **Links Inteligentes:** Uso de `?cid={{clientId}}` em todas as comunicações do WhatsApp para vinculação automática do Pixel ao perfil do cliente.
    *   **Identidade Progressiva:** Captura de dados de login no cardápio para unificar sessões anônimas ao histórico do CRM.

## 2. Integração Profunda com API do ERP & Cardápio
O CRM deixa de ser reativo (pós-venda) para ser orquestrador do ciclo de vida.
*   **Sincronização de Pedidos (`deliveryOrders`):**
    *   Importação em tempo real de: Valor total, Itens (SKUs), Forma de Pagamento e Status.
*   **Gatilhos de Automação (Webhooks do ERP):**
    *   `order.created`: Inicia a régua de relacionamento (confirmação personalizada).
    *   `order.delivered`: Automação de NPS (`pesquisa.js`) sincronizada com o momento exato do consumo.
    *   `order.canceled`: Disparo proativo de tratativa de erro para evitar detratores.
*   **Dados do Cardápio:**
    *   Sincronização de categorias e pratos para permitir segmentação por "Gosto Gastronômico".

## 3. Inteligência de Dados (Brain Engine)
Evolução do modelo de dados para suportar análise preditiva e segmentação avançada.
*   **Motor RFM Dinâmico (Recência, Frequência, Valor):**
    *   Classificação automática de clientes em: *Campeões, Fiéis, Em Risco, Hibernando*.
*   **Predição de Churn (Abandono):**
    *   Identificação de padrões de queda na frequência de pedidos do ERP para agir antes do cliente parar de comprar.
*   **Cálculo de LTV (Lifetime Value):**
    *   Visualização clara do valor financeiro total que cada cliente trouxe para o estabelecimento.

## 4. Automações de Próxima Geração (Marketing Autônomo)
Fluxos que operam 24/7 baseados em dados cruzados:
*   **Recuperação de Carrinho:** Se o Pixel detectar abandono de um cliente "Promotor", enviar incentivo imediato.
*   **Win-back (Reativação):** Automação que envia `cupom.js` para clientes que entraram no segmento "Em Risco" no RFM.
*   **Upsell Personalizado:** Oferta de itens do cardápio baseada no histórico de pedidos (ex: "Vimos que você adora Burgers, que tal provar nossa nova sobremesa?").
*   **Tratativa Proativa:** Notificar o dono do estabelecimento via WhatsApp sobre atrasos críticos detectados no ERP antes da reclamação do cliente.

## 5. Dashboards de ROI e Visão 360º
*   **Atribuição de Receita:** Relatório que prova quanto em R$ as campanhas de WhatsApp geraram em pedidos reais no ERP.
*   **Funil de Comportamento:** Cliques -> Navegação no Cardápio -> Adição ao Carrinho -> Pedido Pago.
*   **Perfil Único do Cliente:** Uma tela consolidando: Notas de NPS, histórico de pedidos ERP, cupons usados, pratos favoritos e interações na roleta.

## 6. Próximos Passos Técnicos
1.  **Endpoints de Ingestão:** Criar rotas para receber eventos do Pixel e Webhooks do ERP.
2.  **Scripts de Segmentação:** Implementar jobs que recalculam o status RFM dos clientes diariamente.
3.  **Interface de Monitoramento:** Desenvolver o dashboard de eventos em tempo real para o lojista acompanhar a "pulsação" do cardápio.

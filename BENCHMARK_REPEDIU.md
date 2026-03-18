# Benchmark Competitivo: Repediu CRM vs. Feedeliza

Este documento consolida a análise técnica e funcional do sistema **Repediu**, servindo como base para o posicionamento estratégico e evolução do **Feedeliza**.

## 1. Perfil do Concorrente (Repediu)
O Repediu é uma plataforma de **Food Marketing** e CRM focada em retenção e aumento de frequência para deliveries e restaurantes. A proposta central é "fazer o cliente pedir de novo" através de automação de mensagens.

## 2. Funcionalidades de Destaque (The "Must-Haves")
Estas são as funções que o mercado já espera de um CRM de alto nível e que o Repediu executa:

*   **Segmentação RFM Automática:** Classificação de clientes em grupos (Novos, Fiéis, Em Risco, Sumidos) baseada em dados reais de pedidos.
*   **Réguas de Relacionamento Multi-canal:** Disparos automáticos via WhatsApp, SMS, E-mail, RCS e Torpedo de Voz.
*   **Automação de Reativação (Win-back):** Mensagens automáticas para clientes que não compram há 30, 60 ou 90 dias.
*   **Dashboard de ROI Transparente:** Exibição clara de quanto dinheiro as campanhas geraram em vendas reais (Atribuição de Receita).
*   **IA Conversacional:** Uso de inteligência artificial para interações automáticas no WhatsApp, facilitando a conversão.

## 3. Oportunidades de Diferenciação para o Feedeliza
Onde o Feedeliza já é superior ou tem potencial de superar o Repediu:

| Funcionalidade | Status Repediu | Vantagem Feedeliza |
| :--- | :--- | :--- |
| **Gestão de NPS** | Básico (Apenas nota) | **Superior:** Possui fluxos de `tratativa.js` e `replica.js` para gestão de crise. |
| **Gamificação** | Via integração externa | **Superior:** Roleta de prêmios e spins (`roleta.js`) nativos no sistema. |
| **Gestão de Equipe** | Limitada | **Superior:** Sistema de metas e premiações para atendentes (`atendenteMeta.js`). |
| **Pixel de Comportamento** | Sim | **Potencial:** Integrar o comportamento de navegação do cardápio diretamente com o perfil de satisfação (NPS). |

## 4. Gap Analysis (O que precisamos implementar)
Para atingir o "Alto Nível" e neutralizar a concorrência:

1.  **Motor RFM Nativo:** Automatizar a troca de "status" do cliente na tabela `clients` com base nas `deliveryOrders` do ERP.
2.  **Atribuição Financeira em Campanhas:** Vincular o `campanha_log` ao fechamento do pedido no ERP para mostrar o ROI em R$.
3.  **Expansão de Canais:** Avaliar a inclusão de SMS/E-mail como contingência para bloqueios de WhatsApp.
4.  **Automações de "Saudades":** Criar gatilhos baseados em inatividade (Ex: "Cliente Fiel sumiu há 20 dias -> Enviar Cupom").

## 5. Conclusão Estratégica
O Repediu foca em **"Volume de Vendas"**. O Feedeliza deve focar em **"Inteligência de Experiência"**. 
Ao unir a base de satisfação (NPS) que você já tem com a automação de recorrência (RFM), o Feedeliza se torna uma ferramenta imbatível, pois não apenas traz o cliente de volta, mas garante que ele volte porque está satisfeito, e não apenas por spam.

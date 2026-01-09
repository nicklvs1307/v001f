# Integração Uai Rango

Este documento descreve a integração com a plataforma de delivery Uai Rango.

## Visão Geral

A integração com o Uai Rango permite que o sistema receba pedidos de delivery diretamente da plataforma Uai Rango. Quando um novo pedido é criado no Uai Rango, um webhook é enviado para o nosso sistema, que então processa o pedido e o salva no banco de dados.

## Webhook

A URL do webhook que deve ser configurada na plataforma Uai Rango é:

`[URL_DA_API]/api/delivery-webhooks/uairango`

Substitua `[URL_DA_API]` pela URL da sua API.

## Payload

O payload esperado do webhook do Uai Rango é um JSON com a seguinte estrutura:

```json
{
  "id_estabelecimento": "string",
  "cod_pedido": "string",
  "cliente": {
    "nome": "string",
    "celular": "string"
  },
  "valor_total": "number",
  "data_pedido": "string"
}
```

## Mapeamento de Dados

Os dados do Uai Rango são mapeados para os seguintes campos do nosso sistema:

| Uai Rango | Nosso Sistema |
| --- | --- |
| `id_estabelecimento` | `Tenant.uairangoEstablishmentId` |
| `cliente.nome` | `Client.name` |
| `cliente.celular` | `Client.phone` |
| `valor_total` | `DeliveryOrder.totalAmount` |
| `cod_pedido` | `DeliveryOrder.orderIdPlatform` |
| `data_pedido` | `DeliveryOrder.orderDate` |

## Tratamento de Erros

O sistema de tratamento de erros foi projetado para ser robusto e informativo.

1.  **Validação de Dados:** Antes de processar qualquer pedido, o sistema valida os dados recebidos para garantir que todos os campos obrigatórios estão presentes e no formato correto.

2.  **Tratamento de Erros de Tenant:** Se um pedido for recebido para um estabelecimento que não está cadastrado em nosso sistema (ou seja, nenhum `Tenant` corresponde ao `uairangoEstablishmentId`), o erro é registrado e o processamento é interrompido.

3.  **Processamento Assíncrono:** Para evitar timeouts e garantir que o Uai Rango receba uma resposta rápida, o processamento do pedido é feito de forma assíncrona.

4.  **Logs Detalhados:** Todas as etapas do processo, desde o recebimento do webhook até a criação do pedido, são registradas em logs detalhados, facilitando a depuração e o monitoramento.

Se um erro ocorrer durante o processamento, ele será registrado com o máximo de detalhes possível, incluindo o payload recebido e o ID do pedido, para que possa ser analisado e resolvido manualmente.

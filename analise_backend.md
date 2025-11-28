# Relatório de Análise e Recomendações do Backend

## 1. Avaliação Geral

O backend está muito bem estruturado e demonstra um alto nível de maturidade. A arquitetura segue padrões sólidos como a separação de responsabilidades (controllers "magros", serviços com a lógica de negócio, repositórios para acesso a dados), o uso de injeção de dependências, e a implementação de segurança robusta com autorização por papel (RBAC) e multi-tenancy.

**Pontos Fortes Notáveis:**
*   **Estrutura do Projeto:** Clara e organizada, facilitando a manutenção.
*   **Segurança:** Autorização granular por tenant e papel do usuário em quase todos os endpoints. Criptografia de chaves de API é um grande diferencial.
*   **Lógica de Negócio Avançada:** Serviços como `CampanhaService` e `senderPoolService` implementam funcionalidades complexas (A/B testing, auto-pause, aquecimento de números) de forma robusta.
*   **Integridade dos Dados:** Uso consistente de transações para operações que envolvem múltiplos modelos (ex: criação de pesquisas e suas perguntas).

**Principais Pontos de Atenção:**
*   **Consistência de Dados:** A principal fonte de problemas, como você descreveu, vem de duplicações na lógica de filtragem e cálculo de métricas.
*   **Otimização de Performance:** Existem oportunidades para otimizar consultas ao banco de dados para evitar buscas desnecessárias (over-fetching) e o problema de N+1 queries.
*   **Bugs Funcionais:** Identifiquei alguns bugs que quebram funcionalidades específicas.

---

## 2. Ações Críticas (Bugs e Inconsistências Graves)

Estes são os problemas que devem ser priorizados, pois impactam diretamente a funcionalidade e a integridade dos dados.

### 2.1. Modelo `Cupom` - Ausência do Campo `campanhaId`
*   **Problema:** O modelo `backend/models/cupom.js` define uma associação `belongsTo(models.Campanha)`, mas não possui o campo `campanhaId` em seu schema (`init` block).
*   **Impacto:** **Isso quebra o rastreamento de conversão em A/B tests.** A função `validateCupom` no `cupomController` tenta acessar `updatedCupom.campanhaId` para registrar uma conversão no `CampanhaLog`, mas o campo sempre será nulo, impedindo o registro.
*   **Solução:**
    1.  Adicionar o campo ao `backend/models/cupom.js`:
        ```javascript
        // Dentro de Cupom.init({...})
        campanhaId: {
          type: DataTypes.UUID,
          allowNull: true, // Permitir nulo, pois um cupom pode ser gerado fora de uma campanha
        },
        ```
    2.  Gerar e executar uma nova `migration` para adicionar a coluna `campanhaId` à tabela `cupons`.

### 2.2. Inconsistência no Cálculo de Métricas (NPS/CSAT)
*   **Problema:** As funções `getSummary` em `backend/src/repositories/dashboard/summary.js` e `getDailyStats` em `backend/src/repositories/resultRepository.js` calculam NPS/CSAT usando agregação SQL (`SUM(CASE WHEN ...)`). Todas as outras partes do sistema (`overall.js`, `criteria.js`, `attendants.js`) usam o `ratingService.js`.
*   **Impacto:** Risco real de dashboards e relatórios mostrarem números de NPS/CSAT diferentes para os mesmos dados. Dificulta a manutenção da definição da métrica.
*   **Solução:** Refatorar as funções `getSummary` e `getDailyStats` para usar `ratingService` para os cálculos, garantindo uma única fonte de verdade.

### 2.3. Bugs nos Controllers do WhatsApp
*   **Problema A (`whatsappTemplateController.js`):** A função `get` chama `whatsappTemplateRepository.findOne`, que não existe. O nome correto é `findByType`.
*   **Problema B (`whatsappConfigController.js`):** A função `handleWebhook` usa as variáveis `event` e `data` que não estão definidas em seu escopo.
*   **Impacto:** Rotas que dependem dessas funções estão quebradas e falharão com erros em tempo de execução.
*   **Solução:**
    *   **A:** Corrigir a chamada em `whatsappTemplateController` para `whatsappTemplateRepository.findByType(tenantId, type)`.
    *   **B:** Corrigir o `handleWebhook` em `whatsappConfigController` para extrair os dados do `req.body`, ex: `const { instance, event, data } = req.body;`.

---

## 3. Recomendações de Arquitetura e Refatoração

Estas são ações de maior impacto para melhorar a manutenibilidade, performance e consistência a longo prazo.

### 3.1. Centralizar Lógica de Filtro de Datas e `tenantId` (Maior Prioridade)
*   **Problema:** A lógica para construir a cláusula `where` com filtros de `tenantId`, `startDate`, `endDate`, e `surveyId` é duplicada em dezenas de funções nos repositórios, especialmente nos arquivos dentro de `backend/src/repositories/dashboard/`.
*   **Impacto:** É a **principal causa das inconsistências de dados** que você observa nos gráficos e relatórios. É extremamente difícil garantir que todos os filtros sejam idênticos e qualquer alteração futura precisaria ser feita em múltiplos lugares.
*   **Solução:** Criar uma função utilitária `buildWhereClause(options)` em `backend/src/utils/` e usá-la em todos os repositórios.
    *   **Exemplo de Implementação (`backend/src/utils/filterUtils.js`):**
        ```javascript
        const { Op } = require("sequelize");

        function buildWhereClause(options = {}) {
          const { tenantId, surveyId, dateRange, dateField = 'createdAt' } = options;
          const where = {};

          if (tenantId) {
            where.tenantId = tenantId;
          }
          if (surveyId) {
            where.pesquisaId = surveyId;
          }
          if (dateRange && dateRange.startDate && dateRange.endDate) {
            where[dateField] = { [Op.between]: [dateRange.startDate, dateRange.endDate] };
          } else if (dateRange && dateRange.startDate) {
            where[dateField] = { [Op.gte]: dateRange.startDate };
          } else if (dateRange && dateRange.endDate) {
            where[dateField] = { [Op.lte]: dateRange.endDate };
          }

          return where;
        }

        module.exports = { buildWhereClause };
        ```
    *   **Uso:** Em cada função de repositório, substituir a construção manual por uma chamada a esta função.

### 3.2. Otimizar Consultas para Evitar Over-fetching e N+1 Queries
*   **Problema:**
    *   **Over-fetching:** Endpoints como `GET /reports/daily` acabam chamando `dashboardRepository.getDashboardData`, que busca todos os dados do dashboard, mesmo que a página só precise de um resumo.
    *   **N+1 Queries:** Funções como `getTenantReports` (em `superadmin/reportService.js`) e a agregação de metas de atendentes (em `dashboard/overall.js`) fazem uma query ao banco de dados para cada item dentro de um loop.
*   **Impacto:** Lentidão no carregamento e carga excessiva no banco de dados, que piorará com o tempo.
*   **Solução:**
    *   **Over-fetching:** Criar endpoints de API mais granulares que busquem apenas os dados necessários para uma tela específica. Por exemplo, a rota `/reports/daily` deveria chamar uma função `getDailyReportData` que busca apenas o sumário e o gráfico de tendência do dia.
    *   **N+1 Queries:** Refatorar os loops para buscar os dados em lote. Por exemplo, para `getTenantReports`, em vez de fazer `Client.count` por tenant, fazer uma única query `Client.count({ group: ['tenantId'] })` e depois mapear os resultados.

---

## 4. Melhorias Menores e Code Smells

*   **Lógica Demográfica Duplicada:** A lógica para calcular distribuição de idade está em `surveyService`, `clientRepository`, e `dashboard/overall.js`. **Solução:** Centralizar em um `demographicsUtils.js`.
*   **Função `update` Duplicada em `tenantRepository.js`:** Existem `update` e `updateTenant`. **Solução:** Unificar em uma única função.
*   **Associação Dinâmica em `clientRepository.js`:** A associação `Client.hasMany(CampanhaLog)` é definida dinamicamente em `findBirthdayClients`. **Solução:** Mover para a definição estática do modelo `client.js`.
*   **`timestamps: true` Ausente em `RoletaPremio.js`:** Inconsistência de definição. **Solução:** Adicionar `timestamps: true` ao `init` do modelo para clareza.
*   **Importações Repetidas:** `Op` e `WhatsappConfig` importados dentro de funções em `whatsappConfigRepository.js`. **Solução:** Mover para o topo do arquivo.
*   **Ordem de Argumentos em `ApiError`:** Em `configController.js`, `new ApiError("message", 404)` foi usado. O padrão no resto da aplicação é `(404, "message")`. **Solução:** Padronizar o uso do construtor.

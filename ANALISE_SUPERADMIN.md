# Análise Completa e Plano de Evolução: Superadmin

Esta análise cobre a estrutura atual do módulo `/superadmin`, identifica lacunas funcionais e propõe melhorias de design, arquitetura e funcionalidades para elevar o nível do sistema.

## 1. Visão Geral do Estado Atual

### Backend
*   **Rotas:** Bem estruturadas em `superadminRoutes`, `senderRoutes`, `reportRoutes`, `franchisorAdminRoutes`.
*   **Modelos:**
    *   `Franchisor` existe e tem relação 1:N com `Tenant`.
    *   `Tenant` tem campos de integração (iFood, Delivery Much, WhatsApp).
    *   `ImpersonationLog` rastreia acessos do Superadmin nas contas dos clientes.
*   **Permissões:** Baseada em verificação simples de string `role.name === "Super Admin"`.
*   **Relatórios:** `reportService.js` traz contagens básicas (Tenants, Users, Surveys) e um gráfico de crescimento de usuários. **Dados de planos são "fictícios" (hardcoded) no código atual.**

### Frontend
*   **Layout:** `SuperAdminLayout` usa Material UI padrão (Drawer lateral + AppBar).
*   **Funcionalidades Visíveis:**
    *   Dashboard (KPIs simples).
    *   Lista de Tenants (Login como tenant, criar, editar).
    *   Lista de Franqueadores (CRUD básico).
    *   Configuração de WhatsApp (Reiniciar/Logout instâncias dos clientes).
    *   Pool de Disparo.
    *   Relatórios básicos.

---

## 2. Análise de Gaps (O que falta)

### A. Gestão de Franquias e Franqueados (Prioridade Alta)
*   **Problema:** Atualmente, Franqueadores e Tenants (Restaurantes) estão em menus separados. Não há uma visão unificada.
*   **O que falta:**
    *   **Painel Hierárquico:** Ao clicar em um Franqueador, deve-se ver um Dashboard *daquela franquia* (KPIs agregados de todos os seus franqueados).
    *   **Criação Vinculada:** Botão "Adicionar Franqueado" diretamente dentro da tela do Franqueador, já preenchendo o `franchisorId`.
    *   **Relatórios Consolidados:** Comparativo de desempenho entre lojas da mesma franquia (Ranking de NPS, Tíquete Médio, etc).

### B. Sistema de Permissões e Planos (Permissionamento)
*   **Problema:** O código assume planos "Básico", "Pro", "Enterprise" mas isso não está no banco de dados de forma estruturada. As permissões são fixas.
*   **O que falta:**
    *   **Tabela `Plans`:** Criar tabela para definir limites (ex: nº de envios WhatsApp, funcionalidades ativas) e preço.
    *   **Gestor de Roles Globais:** O Superadmin deve poder criar "Modelos de Permissão" que aparecem para os Tenants (ex: o Superadmin cria o cargo "Gerente de Marketing" e define o que ele pode fazer, e isso replica para todos os tenants).
    *   **Controle de Feature Flags:** Ativar/Desativar funcionalidades (ex: "Roleta de Prêmios") para um Tenant específico ou Plano sem mudar o código.

### C. Relatórios e BI (Business Intelligence)
*   **Problema:** O Dashboard atual é muito simples.
*   **O que falta:**
    *   **Saúde do Sistema:** Monitoramento de instâncias WhatsApp (quantas caíram hoje? quantas mensagens falharam?).
    *   **Financeiro (Estimado):** Se houver cobrança, relatórios de MRR (Receita Recorrente Mensal) baseados nos planos ativos.
    *   **Auditoria:** Visualização dos logs de `ImpersonationLog` e ações críticas (quem deletou o tenant X?).

### D. Design e Layout (UX/UI)
*   **Problema:** O visual é genérico e pouco informativo para uma tomada de decisão rápida.
*   **Melhorias:**
    *   **Dashboard "Head-up Display":** Cards com alertas coloridos (ex: "3 Tenants com WhatsApp desconectado" em vermelho).
    *   **Busca Global:** Uma barra de pesquisa no topo que busca por Tenant, Franqueador, Email de Usuário ou Telefone em todo o banco.
    *   **Dark Mode:** Opção nativa para conforto visual.
    *   **Feedback Visual:** Melhores indicadores de carregamento e sucesso nas operações de massa.

---

## 3. Plano de Melhorias Detalhado

Aqui está o roteiro sugerido para implementação, dividido por áreas.

### Fase 1: Estrutura de Franquias e Navegação (Backend + Frontend)
1.  **Refatorar Navegação:** Criar uma visão "Árvore de Franquias".
2.  **Dashboard do Franqueador:** Criar endpoint que agrega dados de todos os `tenants` de um `franchisorId`.
3.  **UI de Detalhes:** Na tela de Franqueador, adicionar abas: "Visão Geral", "Lojas (Tenants)", "Usuários da Franqueadora", "Relatórios".

### Fase 2: Permissionamento e Planos
1.  **Modelagem de Planos:** Criar Tabela `Plans` e `TenantPlans`.
2.  **Editor de Permissões:** Interface para o Superadmin marcar quais recursos cada plano acessa (`role_permissions` dinâmico).
3.  **Middleware de Limites:** Backend checar limites do plano (ex: bloquear envio de campanha se excedeu cota).

### Fase 3: Modernização do Layout e Design
1.  **Painel de Auditoria:** Tela para listar logs de ações críticas.
2.  **Central de Notificações Global:** O Superadmin pode enviar um aviso (ex: "Manutenção programada") que aparece no painel de todos os Tenants.
3.  **Reformulação do Dashboard:** Novos Widgets (Gráfico de uso de API, Mapa de calor de acessos, Tabela de "Tenants em Risco" de cancelamento).

### Fase 4: Funcionalidades Operacionais
1.  **Setup Automatizado:** Um "Wizard" para criar um novo Tenant, configurar WhatsApp e importar cardápio em um único fluxo.
2.  **Diagnóstico de WhatsApp:** Ferramenta para testar a conexão de um tenant específico e ver os logs de erro brutos da API do WhatsApp.

---

## 4. Próximos Passos (Ação Imediata)

Para começar, recomendo focarmos na **Fase 1 (Franquias)** ou **Fase 2 (Permissionamento/Planos)**, pois são estruturais.

**Qual destas opções você prefere iniciar agora?**

1.  **Melhorar a Gestão de Franquias:** Criar a visão hierárquica e relatórios consolidados por marca.
2.  **Criar Sistema de Planos e Permissões:** Definir o que cada cliente pode acessar e criar a gestão de cargos globais.
3.  **Revamp Visual do Dashboard:** Focar puramente em deixar o `/superadmin` mais bonito e com mais métricas visuais agora.

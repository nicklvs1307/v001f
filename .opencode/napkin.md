# Napkin Runbook - Feedeliza

## Curation Rules
- Re-prioritize on every read.
- Keep recurring, high-value notes only.
- Max 10 items per category.
- Each item includes date + "Do instead".

## Execution & Validation (Highest Priority)

### 1. [2026-03-30] Erro "Algo deu errado" no fluxo de pesquisa
**Problema:** O erro aparecia quando a API falhava silenciosamente e as cores dinâmicas eram null.

**Correção aplicada:**
- SurveyIdentifyPage.js: Substituir `.catch(() => {})` por tratamento real de erro
- Todas as páginas públicas: Adicionar valores padrão seguros para cores dinâmicas
- Todas as páginas públicas: Wrap getDynamicTheme em try/catch

**Arquivos modificados:**
- `frontend/src/pages/SurveyIdentifyPage.js`
- `frontend/src/pages/ClientIdentificationPage.js`
- `frontend/src/pages/ClientRegistrationPage.js`
- `frontend/src/pages/PublicSurveyPage.js`

## Memory System
- Bootstrap: Início de sessão
- Auto-research: Antes de agir
- Session-logger: Fim de interação
- Learner: Após sucesso
- Alerts-manager: Quando erro

---

## Problemas Recorrentes

### Fluxo de Pesquisa Pública (QR → Pesquisa → Roleta)

**Problema 1:** Tela branca / "Algo deu errado" em alguns celulares
- **Causa:** `.catch(() => {})` silencioso + cores dinâmicas null
- **Solução:** Tratamento de erro + valores padrão seguros

**Problema 2:** SessionStorage bloqueado em modo privado iOS Safari
- **Solução:** Sempre usar try/catch ao acessar sessionStorage/localStorage

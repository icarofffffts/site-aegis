# ARX-12 — Triagem de Tarefas & Sprint Planning

**Empresa:** Arx Solutions
**Issue:** ARX-12
**Data:** 2026-07-05
**Autor:** Lucas (Chief of Staff)

---

## Diagnóstico do Projeto (2026-07-05)

O Aegis Dashboard (TanStack Start + React 19 + Vite 7) está estruturalmente completo em termos de UI, mas apresenta **3 erros TypeScript bloqueantes** que impedem compilação limpa e vários problemas de maturidade.

### Resumo de Descobertas

| Área | Status | Prioridade |
|------|--------|------------|
| TypeScript (17 erros, 3 bloqueantes) | ❌ Crítico | **P0 — Imediato** |
| ThemeToggle (import quebrado) | ❌ Bloqueante | **P0 — Imediato** |
| SiteHeader (TS error no Link) | ❌ Bloqueante | **P0 — Imediato** |
| vite.config.ts (plugin config inválida) | ❌ Bloqueante | **P0 — Imediato** |
| Dashboard authFetch type mismatch | ⚠️ Moderado | **P1** |
| Checkout/Pagamentos (mocado) | ⚠️ Não funcional | **P1** |
| Premium hardcoded (IDs fixos) | ⚠️ Não escalável | **P1** |
| Formulário de contato (mock) | ⚠️ Não funcional | **P2** |
| Ausência de testes | ⚠️ Zero cobertura | **P2** |
| Sessão Discord em base64 (sem crypto) | ⚠️ Risco de segurança | **P2** |
| Sem Zod validation nas APIs | ⚠️ Risco | **P2** |
| Sem CI/CD | ⚠️ Risco operacional | **P3** |
| Sem env.example | ⚠️ Documentação | **P3** |

---

## Sprint Atual (Dias 1-10): Fundação e Qualidade

### P0 — Bloqueantes (3 erros TS)

1. **Fix ThemeToggle** — `useTheme` não é exportado pelo `ThemeProvider`. Criar um context de Theme ou integrar com o hook correto.
2. **Fix SiteHeader** — O `<Link to="/login">` no router do TanStack exige `search` params. Ajustar o tipo ou o uso do Link.
3. **Fix vite.config.ts** — Propriedade `app` não existe no tipo do plugin `tanstackStart`. Ajustar a configuração.

### P1 — Alta Prioridade (refatoração e features)

4. **Fix dashboard authFetch type mismatch** — `authFetch` não é atribuível a `window.fetch`. Ajustar tipagem ou extrair para lib.
5. **Conectar pagamento real** — Stripe/MercadoPago: obter chaves de produção e ativar webhooks.
6. **Premium baseado em subscription** — Substituir lista hardcoded de IDs por verificação no Supabase de subscription ativa.
7. **Documentar env vars** — Criar `.env.example` com todas as variáveis necessárias.

---

## Sprint 2 (Dias 11-20): Monetização e Confiabilidade

1. Conexão real dos gateways de pagamento (Stripe + MercadoPago)
2. Implementar webhooks de eventos de pagamento
3. Feature gating baseado em subscription status real no Supabase
4. Página de gerenciamento de assinatura (cancelamento, upgrade, downgrade)
5. Integrar formulário de contato com a API real (`/api/contact`)

---

## Sprint 3 (Dias 21-30): Segurança e Qualidade

1. Criptografar sessão Discord (trocar base64 por JWT ou crypto real)
2. Zod validation em todas as APIs
3. Rate limiting nos endpoints de auth
4. Configurar CI/CD básico (GitHub Actions: lint + typecheck)
5. Testes unitários nos componentes críticos

---

## Tarefas Imediatas (Triagem)

### Correções de Código (já iniciadas neste heartbeat)

1. `ThemeProvider.tsx` — exportar `useTheme` hook
2. `ThemeToggle.tsx` — corrigir import para usar o hook correto
3. `SiteHeader.tsx` — ajustar tipagem do `Link` para `/login`
4. `vite.config.ts` — remover/ajustar opção `app` do plugin
5. `dashboard.tsx` — refatorar `authFetch` para tipagem correta

### Pendente de Decisão

- **Chaves de pagamento**: Ícaro precisa fornecer `STRIPE_SECRET_KEY` e `MERCADOPAGO_ACCESS_TOKEN` para ativar checkout real.
- **Subscription schema**: Definir modelo de tabela `subscriptions` no Supabase para premium gating.

---

## Alocação de Agentes

| Tarefa | Agente Sugerido |
|--------|----------------|
| Fix TS errors + Theme | Lucas (Chief of Staff) |
| Pagamentos (Stripe/MP) | Rafael (Full-Stack) |
| Premium subscription gating | Rafael (Full-Stack) |
| Zod validation + Security | Samuel (Security) |
| Testes | Igor (QA) |
| CI/CD | Matheus (COO) |

---

## Organograma de Dependências

```
ARX-12 (Sprint Plan)
├── P0: Fix TS compilation
│   ├── ThemeToggle (Lucas)
│   ├── SiteHeader Link (Lucas)
│   └── vite.config (Lucas)
├── P1: Features
│   ├── Stripe/MP integration (Rafael)
│   ├── Subscription gating (Rafael)
│   └── Contact form fix (Rafael)
├── P2: Quality
│   ├── Security fixes (Samuel)
│   ├── Zod validation (Samuel)
│   ├── Tests setup (Igor)
│   └── .env.example (Matheus)
└── P3: Infrastructure
    └── CI/CD pipeline (Matheus)
```

# Plano de correções UX/UI — ClassicosBR

Este é um escopo muito grande (16 blocos, ~30+ arquivos). Vou propor execução em **3 ondas** para manter qualidade e permitir revisão entre cada uma. Confirme qual onda começar (ou se quer tudo de uma vez).

---

## Onda 1 — P0 (Crítico)

Itens fundamentais que travam UX mobile e acessibilidade.

1. **Menu hamburger mobile** (`Header.tsx`)
   - Sheet lateral com todos os links + ações de usuário
   - Ícones Lucide + close-on-click
2. **Contrastes WCAG AA**
   - Substituir `text-white/{25,30,40,45,70}` por versões mais opacas
   - Adicionar `prefers-reduced-motion` em `styles.css`
3. **Resolver busca duplicada na home** (`routes/index.tsx`)
   - Hero search → redireciona para `/anuncios?q=...`
   - Remover filtros e listagem completa da home
   - Manter apenas seção "Destaques" (6 cards) + CTA "Ver todos"
4. **Paginação em `/anuncios`** (`anuncios.index.tsx`)
   - 12 cards/página, `?page=N` na URL
   - Componente `Pagination` shadcn + contador de resultados

---

## Onda 2 — P1 (Importante)

5. **Unificar cores hardcoded → CSS vars** (find/replace global)
6. **Auto-save de rascunho** (`anunciar.tsx`)
   - Hook `useFormDraft` com debounce + localStorage
   - Banner de "Rascunho encontrado"
7. **Stepper visual + validação inline** (`anunciar.tsx`)
8. **Filtros colapsam em Sheet no mobile** (`anuncios.index.tsx`)
   - Badge com contagem de filtros ativos
9. **Aria-labels em botões icon-only** (~12 locais)
10. **Loading skeletons** (`ListingSkeleton` + Suspense)

---

## Onda 3 — P2 (Refinamentos)

11. Touch targets ≥ 44px em mobile
12. Emojis → ícones Lucide (`anuncios.$id.tsx`)
13. Empty states contextuais (variants em `EmptyState.tsx`)
14. Breadcrumbs no admin
15. Skip navigation + landmarks semânticos
16. DemoSwitcher condicionado a `VITE_DEMO_MODE` + remover FAB conflitante

---

## Como prefere prosseguir?

**Opção A** — Eu executo as 3 ondas em sequência sem parar (mais rápido, mas menos checkpoint).
**Opção B** — Executo apenas a Onda 1 (P0) agora, você revisa, e seguimos.
**Opção C** — Outra prioridade/seleção que você indicar.

Recomendo **Opção B** porque mudanças P0 (especialmente remover busca/filtros da home e adicionar paginação) alteram fluxos importantes — vale validar antes de empilhar P1/P2 em cima.

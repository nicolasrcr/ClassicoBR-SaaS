## Escopo

Quatro entregas conectadas para os módulos `/eventos` e `/servicos`, reaproveitando a infra já existente (`traceability.ts`, `TraceabilityPanel`, `app-store`, `moderation.ts`). Tudo permanece em mock/Zustand (sem backend), seguindo o padrão do resto do SAAS.

---

## 1. Validação de origem nos uploads de Eventos

**`src/lib/types.ts`**
- Adicionar `rastreabilidade?: TraceabilityRecord` e `statusModeracao: "pendente" | "aprovado" | "reprovado" | "novas-fotos"` em `ClassicEvent` e `ServiceListing`.

**`src/routes/eventos.tsx`** (formulário inline de publicação)
- Espelhar o fluxo já usado em `servicos.tsx`: `analyzeImageFile` → `buildTraceability` → render do `<TraceabilityPanel />` antes do submit.
- Botão "Publicar" desabilitado quando `scoreOrigem < 50` (mesmo limiar do painel); mostrar mensagem de bloqueio.
- Eventos novos entram com `statusModeracao: "pendente"`.

**`src/routes/eventos.$id.tsx` e `servicos.$id.tsx`**
- Renderizar `<TraceabilityPanel trace={item.rastreabilidade} />` quando disponível (somente para admin/autor — usar `useCurrentUser`).

---

## 2. Denúncias com evidências e trilha de auditoria

**`src/lib/types.ts`** — estender `Report`:
```ts
tipoAlvo: "anuncio" | "evento" | "servico";
alvoId: string;
evidencias: { tipo: "url"|"texto"|"imagem"; valor: string; hash?: string }[];
trilhaAuditoria: { acao: string; autorId: string; em: string; meta?: any }[];
```

**`src/store/app-store.ts`**
- `addReport` agora aceita o shape estendido e gera entrada inicial na trilha (`"denuncia_criada"`).
- Novas actions: `appendAuditTrail(reportId, entry)`, `requestNewPhotos(targetType, id)`.

**Novo componente `src/components/ReportDialog.tsx`**
- Dialog com motivo (select), descrição (textarea ≥ 30 chars), upload opcional de imagens (passa por `analyzeImageFile` → hash SHA-256 anexado como evidência).
- Submit chama `addReport({ tipoAlvo, alvoId, ... })`.

**Integração em `eventos.$id.tsx` e `servicos.$id.tsx`**
- Botão "Denunciar" abre o `ReportDialog`.
- Card "Trilha de auditoria" lista entradas da denúncia (visível para admin/autor).

---

## 3. Busca global e filtros avançados

**`src/routes/eventos.tsx`**
- Estado local de filtros: `search`, `cidade`, `estado`, `tipo` (encontro/exposição/rally/leilão/feira), `dataInicio`, `dataFim`, `sort` (`relevancia`|`data-asc`|`data-desc`).
- "Relevância": score = match em título(3pts) + descrição(2pts) + cidade/estado(1pt cada) + proximidade da data atual (bônus).
- Componente `EventFilters` colapsável no topo.

**`src/routes/servicos.tsx`**
- Mesmos filtros menos data: `search`, `cidade`, `estado`, `tipo` (oficina/autopeça/serviço/peça-classificado), `sort` (`relevancia`|`recente`).

**Helper compartilhado `src/lib/search.ts`** com `scoreRelevance(item, query)` reusável.

---

## 4. Fila de moderação

**Nova rota `src/routes/admin.moderacao.tsx`**
- Tabs: "Eventos" | "Serviços", ordenadas por `scoreOrigem` ascendente (mais suspeitos primeiro).
- Cada card: thumb, título, autor, `<TraceabilityPanel compact />`, status atual.
- Ações: **Aprovar** (`statusModeracao="aprovado"`), **Reprovar** (`"reprovado"` + motivo obrigatório), **Solicitar novas fotos** (`"novas-fotos"` + notificação mock).
- Toda ação grava entrada na trilha de auditoria do item.

**Store**
- `approveModerationItem(tipo, id)`, `rejectModerationItem(tipo, id, motivo)`, `requestNewPhotosFor(tipo, id)`.

**Listagem pública (`eventos.tsx` / `servicos.tsx`)**
- Filtrar para mostrar apenas `statusModeracao === "aprovado"` para usuários não-admin (admin vê tudo com badge de status).

**Header admin**
- Adicionar link "Moderação" no `admin.tsx`.

---

## Detalhes técnicos

- Persistência: Zustand já está persistido em `localStorage`; novos campos entram no mesmo store. Sem migrations / Supabase nesta etapa.
- `screen`/`navigator` já estão guarded em `traceability.ts`.
- Bloqueio de upload: limiar `scoreOrigem >= 50` (consistente com `TraceabilityPanel`).
- Mock-data: adicionar `statusModeracao: "aprovado"` aos eventos/serviços existentes para não sumirem da listagem.

---

## Arquivos tocados

Criar: `src/components/ReportDialog.tsx`, `src/components/EventFilters.tsx`, `src/components/ServiceFilters.tsx`, `src/lib/search.ts`, `src/routes/admin.moderacao.tsx`.

Editar: `src/lib/types.ts`, `src/lib/mock-data.ts`, `src/store/app-store.ts`, `src/routes/eventos.tsx`, `src/routes/eventos.$id.tsx`, `src/routes/servicos.tsx`, `src/routes/servicos.$id.tsx`, `src/routes/admin.tsx`, `src/components/Header.tsx` (se necessário).

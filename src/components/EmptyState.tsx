import { Search, Heart, Inbox, AlertCircle, Car, FileQuestion } from "lucide-react";
import type { ReactNode } from "react";

type Variant = "search" | "favorites" | "inbox" | "error" | "listings" | "default";

const VARIANTS: Record<Variant, { icon: typeof Search; title: string; description: string }> = {
  search:     { icon: Search,       title: "Nenhum resultado encontrado", description: "Tente remover alguns filtros ou buscar por outro termo." },
  favorites:  { icon: Heart,        title: "Sem favoritos ainda",         description: "Toque no coração de um anúncio para guardar aqui." },
  inbox:      { icon: Inbox,        title: "Caixa de entrada vazia",      description: "Suas mensagens com vendedores aparecerão aqui." },
  error:      { icon: AlertCircle,  title: "Algo deu errado",             description: "Não conseguimos carregar essas informações agora." },
  listings:   { icon: Car,          title: "Nenhum anúncio por aqui",     description: "Que tal anunciar o seu clássico?" },
  default:    { icon: FileQuestion, title: "Nada por aqui",               description: "" },
};

export function EmptyState({
  variant = "default",
  title,
  description,
  action,
}: {
  variant?: Variant;
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  const v = VARIANTS[variant];
  const Icon = v.icon;
  const resolvedTitle = title ?? v.title;
  const resolvedDescription = description ?? v.description;
  return (
    <div className="flex flex-col items-center justify-center rounded-[10px] border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-[color:var(--color-surface-cream)]">
        <Icon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="font-serif text-xl">{resolvedTitle}</h3>
      {resolvedDescription && (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{resolvedDescription}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

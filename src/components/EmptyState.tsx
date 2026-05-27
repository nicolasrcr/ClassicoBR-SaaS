import { Search } from "lucide-react";

export function EmptyState({ title = "Nada por aqui", description }: { title?: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[10px] border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-border">
        <Search className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="font-serif text-xl">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

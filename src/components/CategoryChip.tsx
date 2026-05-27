import { CheckCircle2, Wrench, Cog } from "lucide-react";
import type { Category } from "@/lib/types";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICONS: Record<Category, React.ComponentType<{ className?: string }>> = {
  completo: CheckCircle2,
  fazer: Wrench,
  pecas: Cog,
};

export function CategoryChip({
  cat,
  active,
  onClick,
}: {
  cat: Category;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = ICONS[cat];
  const color = CATEGORY_COLORS[cat];
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-[20px] border px-4 py-2 text-sm font-medium transition-all",
        active
          ? "border-transparent text-white"
          : "border-border bg-card text-foreground hover:border-foreground/30",
      )}
      style={active ? { backgroundColor: color } : undefined}
    >
      <Icon className="h-4 w-4" />
      {CATEGORY_LABELS[cat]}
    </button>
  );
}

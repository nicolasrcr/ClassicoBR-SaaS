import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  green: "bg-[color:var(--color-cat-complete)]/10 text-[color:var(--color-cat-complete)] border-[color:var(--color-cat-complete)]/30",
  amber: "bg-[color:var(--color-gold)]/15 text-[#8a6f1e] border-[color:var(--color-gold)]/40",
  red: "bg-[#b1413a]/10 text-[#b1413a] border-[#b1413a]/30",
  gray: "bg-muted text-muted-foreground border-border",
  blue: "bg-[color:var(--color-cat-todo)]/10 text-[color:var(--color-cat-todo)] border-[color:var(--color-cat-todo)]/30",
};

export function StatusBadge({ tone, children }: { tone: keyof typeof TONES; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", TONES[tone])}>
      {children}
    </span>
  );
}

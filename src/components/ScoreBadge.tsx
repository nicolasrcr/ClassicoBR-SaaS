import { scoreConfiancaBadge } from "@/lib/scores";
import { cn } from "@/lib/utils";

export function ScoreBadge({ score, className }: { score: number; className?: string }) {
  const b = scoreConfiancaBadge(score);
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", b.bg, b.text, className)}>
      {b.label}
    </span>
  );
}

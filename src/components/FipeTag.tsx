import { cn } from "@/lib/utils";

export function FipeTag({ perc, className }: { perc: number | null; className?: string }) {
  if (perc === null || perc === 0) return (
    <span className={cn("inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500", className)}>
      FIPE —
    </span>
  );
  const neg = perc < 0;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
      neg ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600", className)}>
      {neg ? `${perc}% abaixo FIPE` : `+${perc}% acima FIPE`}
    </span>
  );
}

import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  green: "bg-[#1D6E4E]/10 text-[#1D6E4E] border-[#1D6E4E]/30",
  amber: "bg-[#C9A84C]/15 text-[#8a6f1e] border-[#C9A84C]/40",
  red: "bg-[#b1413a]/10 text-[#b1413a] border-[#b1413a]/30",
  gray: "bg-muted text-muted-foreground border-border",
  blue: "bg-[#185FA5]/10 text-[#185FA5] border-[#185FA5]/30",
};

export function StatusBadge({ tone, children }: { tone: keyof typeof TONES; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", TONES[tone])}>
      {children}
    </span>
  );
}

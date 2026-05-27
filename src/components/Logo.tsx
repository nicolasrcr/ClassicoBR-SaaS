import { Link } from "@tanstack/react-router";

export function Logo({ subtitle }: { subtitle?: string }) {
  return (
    <Link to="/" className="flex items-baseline gap-2">
      <span className="font-serif text-2xl font-semibold tracking-tight">ClassicosBR</span>
      {subtitle && (
        <span className="text-xs uppercase tracking-widest text-muted-foreground">{subtitle}</span>
      )}
    </Link>
  );
}

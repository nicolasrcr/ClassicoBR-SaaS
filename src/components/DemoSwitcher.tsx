import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useAppStore, useCurrentUser } from "@/store/app-store";

const PROFILES = [
  { id: "u9", label: "Marcos (comprador)" },
  { id: "u1", label: "Rafael (admin)" },
  { id: "u4", label: "Carla (suspensa)" },
  { id: null, label: "Visitante (sem login)" },
];

export function DemoSwitcher() {
  const [open, setOpen] = useState(false);
  const { loginAs, logout } = useAppStore();
  const user = useCurrentUser();

  // Only render in demo mode (default: enabled in dev, off in production unless explicitly enabled)
  const demoEnabled =
    import.meta.env.VITE_DEMO_MODE === "true" || import.meta.env.DEV;
  if (!demoEnabled) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-charcoal)] text-white shadow-lg hover:bg-[color:var(--color-charcoal)]/90 transition-colors"
        title="Demo: trocar perfil"
      >
        <RefreshCw className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute bottom-12 left-0 w-52 rounded-[10px] border border-border bg-card shadow-xl overflow-hidden">
          <p className="px-3 py-2 text-[10px] uppercase tracking-wide text-muted-foreground border-b border-border">Demo: trocar perfil</p>
          {PROFILES.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                if (p.id) loginAs(p.id);
                else logout();
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2.5 text-sm hover:bg-secondary transition-colors text-left ${user?.id === p.id || (!user && !p.id) ? "bg-secondary font-medium" : ""}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

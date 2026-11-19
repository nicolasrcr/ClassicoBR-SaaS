import { ShieldCheck, ShieldAlert, MapPin, Camera, Fingerprint } from "lucide-react";
import type { TraceabilityRecord } from "@/lib/types";

export function TraceabilityPanel({ trace, compact = false }: { trace: TraceabilityRecord; compact?: boolean }) {
  const ok = trace.scoreOrigem >= 70 && !trace.divergenciaLocalizacao;
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {ok ? (
            <ShieldCheck className="h-4 w-4 text-[color:var(--color-cat-complete)]" />
          ) : (
            <ShieldAlert className="h-4 w-4 text-[color:var(--color-terracotta)]" />
          )}
          <p className="text-sm font-semibold">Rastreabilidade da origem</p>
        </div>
        <span className={`text-xs font-bold ${ok ? "text-[color:var(--color-cat-complete)]" : "text-[color:var(--color-terracotta)]"}`}>
          {trace.scoreOrigem}/100
        </span>
      </div>

      <div className="mt-3 grid gap-2 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span>
            IP <span className="font-mono text-foreground">{trace.ip}</span> · {trace.cidadeIp}/{trace.estadoIp}
            {trace.divergenciaLocalizacao && (
              <span className="ml-2 rounded bg-[color:var(--color-terracotta)]/15 px-1.5 py-0.5 text-xs font-semibold text-[color:var(--color-terracotta)]">
                divergência geo
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Fingerprint className="h-3.5 w-3.5 shrink-0" />
          <span className="font-mono text-foreground">{trace.fingerprint}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Camera className="h-3.5 w-3.5 shrink-0" />
          <span>
            {trace.imagens.length} imagem(ns) ·{" "}
            {trace.imagens.filter((i) => i.origemSuspeita).length} marcada(s) como suspeita(s)
          </span>
        </div>
      </div>

      {!compact && trace.imagens.length > 0 && (
        <div className="mt-3 space-y-1.5 border-t border-border pt-3">
          {trace.imagens.map((img, i) => (
            <div key={i} className="flex items-start justify-between gap-2 text-xs">
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{img.nome}</p>
                <p className="font-mono text-muted-foreground truncate">{img.hashSha256.slice(0, 24)}…</p>
                {img.camera && <p className="text-muted-foreground">{img.camera}</p>}
              </div>
              {img.origemSuspeita && (
                <span className="rounded bg-[color:var(--color-terracotta)]/15 px-1.5 py-0.5 text-xs font-semibold text-[color:var(--color-terracotta)] shrink-0">
                  {img.reutilizadaDeAnuncioId ? "reuso" : "sem EXIF"}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
        Validamos IP, fingerprint do navegador, metadados (EXIF) e hash SHA-256 de cada foto para detectar reuso de imagens, divergência geográfica e origem suspeita.
      </p>
    </div>
  );
}
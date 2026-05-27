import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, X, Car, Scale } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FipeTag } from "@/components/FipeTag";
import { ScoreBadge } from "@/components/ScoreBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatKm, formatPrice } from "@/lib/format";
import { useAppStore } from "@/store/app-store";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/comparar")({ component: Comparar });

const ROWS: { key: string; label: string }[] = [
  { key: "photo", label: "Foto" },
  { key: "category", label: "Condição" },
  { key: "price", label: "Preço" },
  { key: "percFipe", label: "% FIPE" },
  { key: "brand", label: "Marca" },
  { key: "model", label: "Modelo" },
  { key: "year", label: "Ano" },
  { key: "engine", label: "Motor" },
  { key: "color", label: "Cor" },
  { key: "km", label: "Quilometragem" },
  { key: "scoreConfianca", label: "Score de confiança" },
  { key: "verificacaoLocalizacao", label: "Localização" },
  { key: "chassiDoc", label: "Chassi" },
  { key: "ipvaDoc", label: "IPVA" },
  { key: "licenciamentoDoc", label: "Licenciamento" },
  { key: "motorDoc", label: "Motor (doc.)" },
  { key: "multasDoc", label: "Multas" },
  { key: "docNomeDoc", label: "Doc. em nome de" },
  { key: "distancia", label: "Distância" },
];

type ListingItem = ReturnType<typeof useAppStore>["listings"][0];

function getValRaw(l: ListingItem, key: string): string {
  if (key === "price") return l.price != null ? String(l.price) : "null";
  if (key === "percFipe") return String(l.percFipe ?? 0);
  if (key === "km") return String(l.km ?? 0);
  if (key === "scoreConfianca") return String(l.scoreConfianca);
  if (key === "verificacaoLocalizacao") return l.verificacaoLocalizacao.badge;
  if (key === "chassiDoc") return l.situacaoDocumental.chassi;
  if (key === "ipvaDoc") return l.situacaoDocumental.ipva;
  if (key === "licenciamentoDoc") return l.situacaoDocumental.licenciamento;
  if (key === "motorDoc") return l.situacaoDocumental.motor;
  if (key === "multasDoc") return l.situacaoDocumental.multas;
  if (key === "docNomeDoc") return l.situacaoDocumental.documentoNome;
  if (key === "photo") return l.photos[0] ?? "";
  return String((l as Record<string, unknown>)[key] ?? "—");
}

function CellContent({ listing, rowKey }: { listing: ListingItem; rowKey: string }) {
  if (rowKey === "photo") {
    return listing.photos[0] ? (
      <img src={listing.photos[0]} alt={listing.title} className="h-28 w-full object-cover rounded-[8px]" />
    ) : (
      <div className="flex h-28 w-full items-center justify-center rounded-[8px] bg-secondary">
        <Car className="h-8 w-8 text-muted-foreground/30" />
      </div>
    );
  }
  if (rowKey === "category") {
    return (
      <span
        className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
        style={{ backgroundColor: CATEGORY_COLORS[listing.category] }}
      >
        {CATEGORY_LABELS[listing.category]}
      </span>
    );
  }
  if (rowKey === "price") return <span className="font-serif font-semibold">{formatPrice(listing.price)}</span>;
  if (rowKey === "percFipe") return <FipeTag perc={listing.percFipe} />;
  if (rowKey === "km") return <span>{formatKm(listing.km)}</span>;
  if (rowKey === "scoreConfianca") return <ScoreBadge score={listing.scoreConfianca} />;
  return <span className="text-sm">{getValRaw(listing, rowKey)}</span>;
}

function Comparar() {
  const { listings, compareIds, toggleCompare } = useAppStore();
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = compareIds
    .map((id) => listings.find((l) => l.id === id))
    .filter(Boolean) as ListingItem[];

  const searchResults = listings.filter(
    (l) =>
      l.status === "ativo" &&
      !compareIds.includes(l.id) &&
      (l.title.toLowerCase().includes(search.toLowerCase()) ||
        l.brand.toLowerCase().includes(search.toLowerCase()) ||
        l.model.toLowerCase().includes(search.toLowerCase())),
  );

  const rawVals = ROWS.map((r) => selected.map((l) => getValRaw(l, r.key)));
  const isDiff = (rowVals: string[]) => rowVals.length > 1 && new Set(rowVals).size > 1;
  const isSame = (rowVals: string[]) => rowVals.length > 1 && new Set(rowVals).size === 1;

  if (selected.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-4xl px-6 py-20 text-center">
          <Scale className="h-16 w-16 mx-auto mb-6 text-muted-foreground/30" strokeWidth={1} />
          <h1 className="font-serif text-3xl mb-3">Comparar veículos</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Adicione até 3 anúncios para ver as diferenças lado a lado. Valores diferentes são destacados em âmbar, iguais em cinza.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => setAddOpen(true)}
              className="bg-[color:var(--color-terracotta)] text-white hover:bg-[color:var(--color-terracotta)]/90"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Adicionar veículo
            </Button>
            <Button asChild variant="outline">
              <Link to="/">Explorar anúncios</Link>
            </Button>
          </div>
        </main>
        <Footer />

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Adicionar veículo à comparação</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Buscar por marca, modelo ou título…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-3"
              autoFocus
            />
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {searchResults.slice(0, 15).map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between gap-3 rounded-[8px] border border-border p-3 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {l.photos[0] ? (
                      <img src={l.photos[0]} alt={l.title} className="h-10 w-14 rounded object-cover shrink-0" />
                    ) : (
                      <div className="h-10 w-14 rounded bg-secondary flex items-center justify-center shrink-0">
                        <Car className="h-4 w-4 text-muted-foreground/40" />
                      </div>
                    )}
                    <div>
                      <p className="font-serif text-sm">{l.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(l.price)} · {l.city}/{l.state}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      toggleCompare(l.id);
                      if (compareIds.length >= 2) setAddOpen(false);
                    }}
                    className="shrink-0 bg-[color:var(--color-terracotta)] text-white"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              {searchResults.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-6">Nenhum resultado encontrado</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center justify-between mb-6 gap-4">
          <h1 className="font-serif text-3xl">Comparar veículos</h1>
          {selected.length < 3 && (
            <Button onClick={() => setAddOpen(true)} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1.5" /> Adicionar veículo
            </Button>
          )}
        </div>

        <div className="overflow-x-auto rounded-[10px] border border-border">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="w-36 min-w-[144px] text-left p-4 text-xs uppercase tracking-wide text-muted-foreground font-medium sticky left-0 bg-secondary/50">
                  Característica
                </th>
                {selected.map((l) => (
                  <th key={l.id} className="p-4 min-w-[220px] text-center align-top">
                    <div className="flex flex-col items-center gap-2">
                      {l.photos[0] ? (
                        <img src={l.photos[0]} alt={l.title} className="h-20 w-full max-w-[180px] object-cover rounded-[8px]" />
                      ) : (
                        <div className="flex h-20 w-full max-w-[180px] items-center justify-center rounded-[8px] bg-secondary">
                          <Car className="h-6 w-6 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="font-serif text-sm font-semibold line-clamp-2">{l.title}</div>
                      <div className="text-xs text-muted-foreground">{l.city}, {l.state}</div>
                      <div className="flex items-center gap-2">
                        <Link
                          to="/car/$id"
                          params={{ id: l.id }}
                          className="text-[11px] text-[color:var(--color-terracotta)] hover:underline font-medium"
                        >
                          Ver anúncio →
                        </Link>
                        <span className="text-muted-foreground text-[11px]">·</span>
                        <button
                          onClick={() => toggleCompare(l.id)}
                          className="text-[11px] text-muted-foreground hover:text-destructive transition-colors flex items-center gap-0.5"
                        >
                          <X className="h-3 w-3" /> Remover
                        </button>
                      </div>
                    </div>
                  </th>
                ))}
                {selected.length < 3 && (
                  <th className="p-4 min-w-[160px] text-center">
                    <button
                      onClick={() => setAddOpen(true)}
                      className="flex flex-col items-center gap-2 w-full mx-auto text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <div className="flex h-20 w-full max-w-[180px] mx-auto items-center justify-center rounded-[8px] border-2 border-dashed border-border hover:border-foreground/40 transition-colors">
                        <Plus className="h-5 w-5" />
                      </div>
                      <span className="text-xs">Adicionar veículo</span>
                    </button>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, ri) => {
                const rowVals = rawVals[ri];
                const diff = isDiff(rowVals);
                const same = isSame(rowVals);
                const isEven = ri % 2 === 0;
                return (
                  <tr
                    key={row.key}
                    className={cn(
                      "border-b border-border last:border-0",
                      isEven ? "bg-card" : "bg-background",
                    )}
                  >
                    <td className="p-3 text-xs uppercase tracking-wide text-muted-foreground font-medium align-middle sticky left-0 bg-inherit">
                      {row.label}
                    </td>
                    {selected.map((l) => (
                      <td
                        key={l.id}
                        className={cn(
                          "p-3 text-sm text-center align-middle transition-colors",
                          diff && "bg-amber-50",
                          !diff && same && "bg-gray-50/80",
                        )}
                      >
                        <div className="flex items-center justify-center">
                          <CellContent listing={l} rowKey={row.key} />
                        </div>
                      </td>
                    ))}
                    {selected.length < 3 && <td className="p-3" />}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-6 rounded bg-amber-100 border border-amber-200" />
            <span>Valores diferentes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-6 rounded bg-gray-50 border border-gray-200" />
            <span>Valores iguais</span>
          </div>
        </div>
      </main>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar veículo à comparação</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Buscar por marca, modelo ou título…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-3"
            autoFocus
          />
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {searchResults.slice(0, 15).map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between gap-3 rounded-[8px] border border-border p-3 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-3">
                  {l.photos[0] ? (
                    <img src={l.photos[0]} alt={l.title} className="h-10 w-14 rounded object-cover shrink-0" />
                  ) : (
                    <div className="h-10 w-14 rounded bg-secondary flex items-center justify-center shrink-0">
                      <Car className="h-4 w-4 text-muted-foreground/40" />
                    </div>
                  )}
                  <div>
                    <p className="font-serif text-sm">{l.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(l.price)} · {l.city}/{l.state}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    toggleCompare(l.id);
                    if (compareIds.length >= 2) setAddOpen(false);
                  }}
                  className="shrink-0 bg-[color:var(--color-terracotta)] text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            {searchResults.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-6">Nenhum resultado encontrado</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

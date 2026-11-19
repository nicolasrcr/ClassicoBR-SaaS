import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import {
  ArrowLeft, Car, ChevronDown, ChevronUp, Copy, ExternalLink, Flag,
  ArrowRight, Heart, Lock, MapPin, MessageCircle, Phone, Share2, ShieldCheck, Star, UserPlus, X, AlertTriangle, BadgeCheck, CheckCircle2, HelpCircle, Lightbulb, Mail,
  ChevronLeft, ChevronRight, Maximize2,
} from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScoreBadge } from "@/components/ScoreBadge";
import { LockedListingGate } from "@/components/LockedListingGate";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/types";
import { formatDate, formatKm, formatPrice } from "@/lib/format";
import { useAppStore, useCurrentUser } from "@/store/app-store";
import { useFavoritesStore } from "@/store/favorites-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/anuncios/$id")({ component: AnuncioDetalhe });

// ──────────────────────────────────────────────────────────
// Label maps
// ──────────────────────────────────────────────────────────
const DOC_LABELS: Record<string, string> = {
  proprio: "Próprio nome",
  terceiro: "Nome de terceiro",
  falecido: "Proprietário falecido",
  empresaExtinta: "Empresa extinta",
  desconhecido: "Desconhecido",
  nenhuma: "Nenhuma",
  "1a2": "1 a 2",
  "3oumais": "3 ou mais",
  naosei: "Não sei",
  emDia: "Em dia",
  isentoAntiguidade: "Isento (antiguidade)",
  atrasado: "Atrasado",
  naoSeAplica: "Não se aplica",
  nuncaLicenciadoEstado: "Nunca licenciado no estado",
  sucata: "Sucata",
  semPlaca: "Sem placa",
  visivelLegivel: "Visível e legível",
  parcialmenteLegivel: "Parcialmente legível",
  ilegivel: "Ilegível",
  recarimbado: "Recarimbado",
  naoLocalizado: "Não localizado",
  original: "Original",
  trocadoMesmaFamilia: "Trocado (mesma família)",
  trocadoDiferente: "Trocado (diferente)",
  semNumero: "Sem número",
  comMultas: "Com multas",
  naoVerificado: "Não verificado",
  sim: "Sim",
  parcialmente: "Parcialmente",
  nao: "Não",
};

const OK_VALS = [
  "proprio", "nenhuma", "emDia", "isentoAntiguidade", "visivelLegivel",
  "original", "naoSeAplica", "sim",
];
const WARN_VALS = [
  "terceiro", "1a2", "atrasado", "parcialmenteLegivel", "nuncaLicenciadoEstado",
  "trocadoMesmaFamilia", "comMultas", "parcialmente", "naosei", "3oumais",
  "trocadoDiferente",
];

function docIcon(val: string): "ok" | "warn" | "unknown" {
  if (OK_VALS.includes(val)) return "ok";
  if (WARN_VALS.includes(val)) return "warn";
  return "unknown";
}

function DocIcon({ val }: { val: string }) {
  const kind = docIcon(val);
  if (kind === "ok") return <CheckCircle2 className="h-4 w-4 text-[color:var(--color-cat-complete)]" aria-hidden="true" />;
  if (kind === "warn") return <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden="true" />;
  return <HelpCircle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />;
}

// ──────────────────────────────────────────────────────────
// Localização badge — divergência NUNCA é mostrada como fraude ao comprador
// ──────────────────────────────────────────────────────────
function LocBadge({ badge }: { badge: string }) {
  if (badge === "verificada")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
        <CheckCircle2 className="h-3 w-3" /> Localização verificada
      </span>
    );
  if (badge === "provavel" || badge === "divergencia")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
        <AlertTriangle className="h-3 w-3" /> Localização provável
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
      Sem dados de verificação
    </span>
  );
}

// ──────────────────────────────────────────────────────────
// Gallery
// ──────────────────────────────────────────────────────────
function Gallery({ photos, title }: { photos: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const imgList = photos.length > 0 ? photos : Array(5).fill(null);
  const prev = useCallback(
    () => setActive((i) => (i > 0 ? i - 1 : imgList.length - 1)),
    [imgList.length]
  );
  const next = useCallback(
    () => setActive((i) => (i < imgList.length - 1 ? i + 1 : 0)),
    [imgList.length]
  );

  return (
    <>
      {/* Main image */}
      <div className="relative flex aspect-[16/9] items-center justify-center rounded-[10px] border border-border bg-secondary overflow-hidden">
        {imgList[active] ? (
          <img src={imgList[active]} alt={title} className="h-full w-full object-cover" />
        ) : (
          <Car className="h-24 w-24 text-muted-foreground/30" strokeWidth={1.2} />
        )}

        {/* Nav arrows */}
        {imgList.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Fullscreen btn */}
        <button
          onClick={() => setFullscreen(true)}
          className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>

        {/* Counter */}
        <span className="absolute bottom-3 left-3 rounded-full bg-black/50 px-2 py-0.5 text-xs font-medium text-white">
          {active + 1} / {imgList.length}
        </span>
      </div>

      {/* Thumbnails */}
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {imgList.slice(0, 5).map((src, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={cn(
              "relative flex-shrink-0 h-16 w-24 overflow-hidden rounded-[6px] border-2 transition-all",
              active === i ? "border-[color:var(--color-terracotta-soft)]" : "border-border opacity-60 hover:opacity-100"
            )}
          >
            {src ? (
              <img src={src} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-secondary">
                <Car className="h-5 w-5 text-muted-foreground/40" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Fullscreen modal */}
      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden bg-black border-0">
          <div className="relative flex aspect-[16/9] items-center justify-center">
            {imgList[active] ? (
              <img src={imgList[active]} alt={title} className="h-full w-full object-contain" />
            ) : (
              <Car className="h-24 w-24 text-white/30" />
            )}
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => setFullscreen(false)}
              className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ──────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────
function AnuncioDetalhe() {
  const { id } = Route.useParams();
  const { listings, users } = useAppStore();
  const user = useCurrentUser();
  const { toggle, isFavorited } = useFavoritesStore();
  const listing = listings.find((l) => l.id === id);
  const router = useRouter();

  const [showEstimador, setShowEstimador] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportNote, setReportNote] = useState("");
  const [msgText, setMsgText] = useState("");
  const [showPhone, setShowPhone] = useState(false);

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="mx-auto max-w-3xl px-6 py-20 text-center flex-1">
          <Car className="mx-auto h-16 w-16 text-muted-foreground/30 mb-6" strokeWidth={1} />
          <h2 className="font-serif text-2xl font-semibold">Anúncio não encontrado</h2>
          <p className="mt-2 text-muted-foreground text-sm">Este anúncio pode ter sido removido ou o link está incorreto.</p>
          <Button asChild className="mt-6 bg-[color:var(--color-terracotta-soft)] text-white hover:bg-[color:var(--color-terracotta-dark)]">
            <Link to="/anuncios">Ver todos os anúncios</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  // Gate: exige login para ver os detalhes completos do anúncio
  if (!user) {
    const goBack = () => {
      if (typeof window !== "undefined" && window.history.length > 1) {
        router.history.back();
      } else {
        router.navigate({ to: "/anuncios" });
      }
    };
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <LockedListingGate listing={listing} onBack={goBack} />
        <Footer />
      </div>
    );
  }

  const seller = users.find((u) => u.id === listing.sellerId);
  const color = CATEGORY_COLORS[listing.category];
  const favorited = user ? isFavorited(user.id, listing.id) : false;
  const similares = listings
    .filter((l) => l.brand === listing.brand && l.id !== listing.id && l.status === "ativo")
    .slice(0, 6);
  const sit = listing.situacaoDocumental;

  // Pendências documentais
  const hasPendencias =
    sit.ipva === "atrasado" ||
    sit.licenciamento === "atrasado" ||
    sit.licenciamento === "nuncaLicenciadoEstado" ||
    sit.chassi !== "visivelLegivel" ||
    sit.motor !== "original" ||
    sit.documentoNome !== "proprio";

  // Estimador
  const ipvaCusto =
    sit.ipva === "atrasado" && sit.ipvaAnosAtraso
      ? Math.round((listing.price ?? 30000) * 0.04 * sit.ipvaAnosAtraso)
      : 0;
  const totalEstimado = ipvaCusto + 400 + 180 + 250;

  // Seller stars (score / 20, max 5)
  const sellerStars = seller ? Math.round(seller.sellerScore / 20) : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        {/* Breadcrumb back */}
        <Link
          to="/anuncios"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para anúncios
        </Link>

        <div className="mt-6 grid gap-10 md:grid-cols-3">
          {/* ──────── LEFT COLUMN (2/3) ──────── */}
          <div className="md:col-span-2 space-y-8">

            {/* Gallery */}
            <Gallery photos={listing.photos} title={listing.title} />

            {/* Header info */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white"
                  style={{ backgroundColor: color }}
                >
                  {CATEGORY_LABELS[listing.category]}
                </span>
                <LocBadge badge={listing.verificacaoLocalizacao.badge} />
                <ScoreBadge score={listing.scoreConfianca} />
                {user && (
                  <button
                    onClick={() => toggle(user.id, listing.id)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4",
                        favorited && "fill-[color:var(--color-terracotta-soft)] text-[color:var(--color-terracotta-soft)]"
                      )}
                    />
                    {favorited ? "Salvo" : "Salvar"}
                  </button>
                )}
              </div>

              <h1 className="mt-3 font-serif text-3xl font-semibold md:text-4xl leading-tight">
                {listing.title}
              </h1>
              <p className="mt-1.5 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {listing.city}, {listing.state} — {listing.distancia}
              </p>

              {/* Price */}
              <div className="mt-5 flex flex-wrap items-end gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Preço</p>
                  <p className="font-serif text-3xl font-semibold text-foreground">
                    {listing.price ? formatPrice(listing.price) : (
                      <span className="text-xl text-muted-foreground">A combinar</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Preço suspeito */}
              {listing.alertaPrecoSuspeito && (
                <div className="mt-3 rounded-[8px] bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Este veículo está anunciado muito abaixo do valor de mercado. Recomendamos atenção especial antes de negociar.</span>
                </div>
              )}
            </div>

            {/* Especificações */}
            <div>
              <h2 className="font-serif text-xl font-semibold">Especificações</h2>
              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 rounded-[10px] border border-border bg-card p-5 text-sm md:grid-cols-2">
                {[
                  ["Marca", listing.brand],
                  ["Modelo", listing.model],
                  ["Ano fabricação", listing.year],
                  ["Ano modelo", listing.year],
                  ["Motor", listing.engine],
                  ["Combustível", "Gasolina"],
                  ["Câmbio", "Manual"],
                  ["Cor", listing.color],
                  ["Quilometragem", listing.km ? formatKm(listing.km) : "Não informado"],
                  ["Carroceria", "Sedan"],
                  ["Final de placa", listing.chassi?.slice(-1) ?? "—"],
                  ["Único dono", sit.transferenciasAcumuladas === "nenhuma" ? "Sim" : "Não"],
                  ["IPVA", DOC_LABELS[sit.ipva] ?? sit.ipva],
                  ["Com manual", sit.documentosFisicos.includes("Manual do proprietário") ? "Sim" : "Não informado"],
                  ["Com chave reserva", sit.documentosFisicos.includes("Chave reserva") ? "Sim" : "Não informado"],
                  ["Aceita troca", sit.aceitaAjudarRegularizacao === "nao" ? "Não" : "Consultar"],
                ].map(([k, v]) => (
                  <div key={k as string}>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">{k}</dt>
                    <dd className="mt-0.5 font-medium text-sm">{String(v)}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Dossiê Documental */}
            <div className="rounded-[10px] border-2 border-[color:var(--color-terracotta-soft)]/40 p-5">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="font-serif text-xl font-semibold">Dossiê Documental</h2>
                <span className="rounded-full bg-[color:var(--color-terracotta-soft)]/10 px-2 py-0.5 text-xs font-semibold text-[color:var(--color-terracotta-soft)] uppercase tracking-wide">
                  Declarado
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  ["Documento em nome de", sit.documentoNome],
                  ["Transferências acumuladas", sit.transferenciasAcumuladas],
                  ["IPVA", sit.ipva + (sit.ipvaAnosAtraso ? ` (${sit.ipvaAnosAtraso} anos)` : "")],
                  ["Licenciamento", sit.licenciamento],
                  ["Chassi", sit.chassi],
                  ["Motor", sit.motor],
                  [
                    "Multas",
                    sit.multas + (sit.multasValor ? ` — R$ ${sit.multasValor}` : ""),
                  ],
                  ["Aceita ajudar na regularização", sit.aceitaAjudarRegularizacao],
                ].map(([k, v]) => {
                  const raw = (v as string).split(" ")[0];
                  const label = DOC_LABELS[raw] ?? v;
                  return (
                    <div key={k} className="flex items-start gap-2.5 text-sm">
                      <DocIcon val={raw} />
                      <div>
                        <dt className="text-xs text-muted-foreground uppercase tracking-wide">{k}</dt>
                        <dd className="font-medium">{label as string}</dd>
                      </div>
                    </div>
                  );
                })}
              </div>

              {sit.documentosFisicos.length > 0 && (
                <div className="mt-4 text-sm">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    Documentos físicos disponíveis:{" "}
                  </span>
                  <span className="font-medium">{sit.documentosFisicos.join(", ")}</span>
                </div>
              )}

              {hasPendencias && (
                <div className="mt-4 rounded-[8px] bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800 flex items-start gap-2">
                  <HelpCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Pendências documentais são comuns em veículos com mais de 25 anos. Considere os custos de regularização ao negociar o preço.</span>
                </div>
              )}

              <p className="mt-3 text-xs text-muted-foreground">
                Declarado pelo vendedor — não verificado pela plataforma
              </p>
            </div>

            {/* Estimador de Regularização (colapsável) */}
            <div className="rounded-[10px] border border-border overflow-hidden">
              <button
                onClick={() => setShowEstimador((v) => !v)}
                className="flex w-full items-center justify-between p-4 text-sm font-medium hover:bg-secondary/40 transition-colors"
              >
                <span>📋 Estimar custos de regularização</span>
                {showEstimador ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              {showEstimador && (
                <div className="border-t border-border p-4 space-y-2 text-sm bg-secondary/20">
                  {ipvaCusto > 0 && (
                    <div className="flex justify-between">
                      <span>IPVA atrasado ({sit.ipvaAnosAtraso} anos)</span>
                      <span>~{formatPrice(ipvaCusto)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Licenciamento + DUT</span>
                    <span>~R$ 400</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transferência de propriedade</span>
                    <span>~R$ 180</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vistoria cautelar</span>
                    <span>~R$ 250</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 font-semibold text-[color:var(--color-terracotta-soft)]">
                    <span>Total estimado</span>
                    <span>~{formatPrice(totalEstimado)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground pt-1 flex items-center gap-1">
                    <Lightbulb className="h-3 w-3" /> Use este valor como argumento na negociação
                  </p>
                </div>
              )}
            </div>

            {/* Descrição */}
            <div>
              <h2 className="font-serif text-xl font-semibold">Descrição</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/80">
                {listing.description}
              </p>
              <Link
                to="/compra-segura"
                className="mt-4 inline-flex items-center gap-1 text-xs text-[color:var(--color-terracotta-soft)] hover:underline"
              >
                <Lock className="h-3 w-3" /> Guia de compra segura <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

            {/* Você sabia? — bloco editorial estático */}
            <div className="rounded-[10px] border border-border bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Você sabia?
              </p>
              <h3 className="font-serif text-base font-semibold mb-2">
                Sobre o {listing.brand} {listing.model}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                O {listing.model} é um dos clássicos mais valorizados da história automotiva brasileira.
                Lançado na era do "milagre econômico", tornou-se símbolo de uma geração.
                Hoje exemplares bem conservados são disputados por colecionadores em todo o Brasil,
                com valorização consistente acima da inflação nas últimas décadas.
              </p>
            </div>

            {/* Carros similares */}
            {similares.length > 0 && (
              <div>
                <h2 className="font-serif text-xl font-semibold mb-4">Veículos similares</h2>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {similares.map((s) => (
                    <Link
                      key={s.id}
                      to="/anuncios/$id"
                      params={{ id: s.id }}
                      className="flex-shrink-0 w-48 rounded-[10px] border border-border bg-card overflow-hidden hover:border-[color:var(--color-terracotta-soft)]/40 transition-colors"
                    >
                      <div className="flex aspect-[4/3] items-center justify-center bg-secondary overflow-hidden">
                        {s.photos.length > 0 ? (
                          <img src={s.photos[0]} alt={s.title} className="h-full w-full object-cover" />
                        ) : (
                          <Car className="h-10 w-10 text-muted-foreground/30" strokeWidth={1.2} />
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-serif text-sm font-semibold leading-tight line-clamp-2">
                          {s.title}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-[color:var(--color-terracotta-soft)]">
                          {formatPrice(s.price)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Report */}
            <button
              onClick={() => setReportOpen(true)}
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Flag className="h-3.5 w-3.5" />
              Denunciar anúncio
            </button>
          </div>

          {/* ──────── RIGHT COLUMN — sticky (1/3) ──────── */}
          <aside className="md:col-span-1">
            <div className="sticky top-24 space-y-4">

              {/* Price card */}
              <div className="rounded-[10px] border border-border bg-card p-5">
                <p className="text-xs text-muted-foreground mb-1">Preço</p>
                <p className="font-serif text-3xl font-bold text-foreground">
                  {listing.price ? formatPrice(listing.price) : (
                    <span className="text-xl font-normal text-muted-foreground">A combinar</span>
                  )}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Valor negociável — peça raríssima</p>

                {/* Share buttons */}
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Link copiado!");
                    }}
                  >
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    Copiar link
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() =>
                      window.open(
                        `https://wa.me/?text=${encodeURIComponent(window.location.href)}`
                      )
                    }
                  >
                    <Share2 className="h-3.5 w-3.5 mr-1" />
                    WhatsApp
                  </Button>
                </div>

                {/* Favorite */}
                {user && (
                  <button
                    onClick={() => toggle(user.id, listing.id)}
                    className={cn(
                      "mt-2 w-full flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-all border",
                      favorited
                        ? "border-[color:var(--color-terracotta-soft)] bg-[color:var(--color-terracotta-soft)]/8 text-[color:var(--color-terracotta-soft)]"
                        : "border-border text-muted-foreground hover:border-[color:var(--color-terracotta-soft)]/40 hover:text-[color:var(--color-terracotta-soft)]"
                    )}
                  >
                    <Heart
                      className={cn("h-4 w-4", favorited && "fill-[color:var(--color-terracotta-soft)]")}
                    />
                    {favorited ? "Salvo nos favoritos" : "Salvar nos favoritos"}
                  </button>
                )}
              </div>

              {/* Seller card */}
              <div className="rounded-[10px] border border-border bg-card p-5">
                {seller ? (
                  <>
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-12 w-12 ring-2 ring-[color:var(--color-terracotta-soft)]/20">
                        <AvatarFallback className="bg-[color:var(--color-terracotta-soft)]/10 font-serif text-[color:var(--color-terracotta-soft)] font-semibold">
                          {seller.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Link
                          to="/perfil/$id"
                          params={{ id: seller.id }}
                          className="font-serif text-base font-semibold hover:text-[color:var(--color-terracotta-soft)] hover:underline transition-colors"
                        >
                          {seller.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          Membro desde {formatDate(seller.memberSince)}
                        </p>
                      </div>
                    </div>

                    {/* Verification badges — only show verified ones */}
                    <div className="flex gap-1 flex-wrap mb-3">
                      {seller.verificacoes.email && (
                        <Badge variant="secondary" className="text-xs font-normal gap-1"><Mail className="h-3 w-3" /> E-mail</Badge>
                      )}
                      {seller.verificacoes.telefone && (
                        <Badge variant="secondary" className="text-xs font-normal gap-1"><Phone className="h-3 w-3" /> Tel</Badge>
                      )}
                      {seller.verificacoes.cpf && (
                        <Badge variant="secondary" className="text-xs font-normal gap-1"><BadgeCheck className="h-3 w-3" /> CPF</Badge>
                      )}
                      {seller.verificacoes.kyc && (
                        <Badge className="text-xs font-semibold bg-yellow-100 text-yellow-800 border-yellow-300 gap-1">
                          <ShieldCheck className="h-3 w-3" /> KYC Verificado
                        </Badge>
                      )}
                    </div>

                    {/* Stars + score */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-3.5 w-3.5",
                              i < sellerStars
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/30"
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {seller.sellerScore}/100
                      </span>
                    </div>

                    {/* Meta info */}
                    <div className="grid grid-cols-2 gap-y-1.5 text-xs text-muted-foreground mb-4">
                      <span>
                        Resposta:{" "}
                        <strong className="text-foreground">{seller.taxaResposta}%</strong>
                      </span>
                      <span>
                        Responde:{" "}
                        <strong className="text-foreground">{seller.tempoMedioResposta}</strong>
                      </span>
                      <span>
                        Vendidos:{" "}
                        <strong className="text-foreground">{seller.carrosVendidos}</strong>
                      </span>
                      <span>
                        Anúncios:{" "}
                        <strong className="text-foreground">
                          {listings.filter((l) => l.sellerId === seller.id && l.status === "ativo").length}
                        </strong>
                      </span>
                    </div>

                    {/* CTA buttons */}
                    <div className="flex flex-col gap-2">
                      {/* Ver telefone — locked if < 3 messages */}
                      <Button
                        className="bg-[color:var(--color-terracotta-soft)] text-white hover:bg-[color:var(--color-terracotta-dark)] w-full"
                        onClick={() => {
                          if (!seller.verificacoes.telefone) {
                            toast.warning("Vendedor sem telefone verificado");
                            return;
                          }
                          setShowPhone((v) => !v);
                        }}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        {showPhone ? (
                          <span className="flex items-center gap-2">
                            {seller.phone}
                            <Copy
                              className="h-3.5 w-3.5 cursor-pointer opacity-70 hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(seller.phone);
                                toast.success("Copiado!");
                              }}
                            />
                          </span>
                        ) : (
                          "Ver telefone"
                        )}
                      </Button>

                      {/* Enviar mensagem */}
                      <Button
                        variant="outline"
                        className="border-[color:var(--color-terracotta-soft)] text-[color:var(--color-terracotta-soft)] hover:bg-[color:var(--color-terracotta-soft)]/5 w-full"
                        onClick={() => {
                          if (!user) {
                            toast.error("Faça login para enviar mensagem");
                            return;
                          }
                          setMsgOpen(true);
                        }}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Enviar mensagem
                      </Button>

                      {/* Ver todos anúncios vendedor */}
                      <Button asChild variant="ghost" size="sm" className="w-full text-xs text-muted-foreground">
                        <Link to="/perfil/$id" params={{ id: seller.id }}>
                          Ver todos os anúncios deste vendedor
                        </Link>
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Vendedor não encontrado.</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* ──────── Modals ──────── */}

      {/* Denunciar */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Denunciar anúncio</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {[
              "Anúncio duplicado",
              "Informações falsas",
              "Veículo não existe",
              "Golpe",
              "Outro",
            ].map((r) => (
              <label key={r} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="reason"
                  value={r}
                  checked={reportReason === r}
                  onChange={() => setReportReason(r)}
                  className="accent-[color:var(--color-terracotta-soft)]"
                />
                <span className="text-sm">{r}</span>
              </label>
            ))}
            <Textarea aria-label="Observações adicionais (opcional)"
              placeholder="Observações adicionais (opcional)"
              rows={3}
              value={reportNote}
              onChange={(e) => setReportNote(e.target.value)}
            />
            <Button
              className="w-full bg-[color:var(--color-terracotta-soft)] text-white hover:bg-[color:var(--color-terracotta-dark)]"
              disabled={!reportReason}
              onClick={() => {
                toast.success("Denúncia enviada. Obrigado!");
                setReportOpen(false);
                setReportReason("");
                setReportNote("");
              }}
            >
              Enviar denúncia
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enviar mensagem */}
      <Dialog open={msgOpen} onOpenChange={setMsgOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">
              Enviar mensagem para {seller?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Re: {listing.title}
            </p>
            <Textarea aria-label="Olá, tenho interesse no seu anúncio"
              placeholder="Olá, tenho interesse no seu anúncio…"
              rows={5}
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
            />
            <Button
              className="w-full bg-[color:var(--color-terracotta-soft)] text-white hover:bg-[color:var(--color-terracotta-dark)]"
              disabled={!msgText.trim()}
              onClick={() => {
                toast.success("Mensagem enviada!");
                setMsgOpen(false);
                setMsgText("");
              }}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Enviar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

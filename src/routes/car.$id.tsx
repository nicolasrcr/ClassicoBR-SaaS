import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
  AlertTriangle, ArrowLeft, BadgeCheck, Car, Check, CheckCircle2, ChevronDown, ChevronUp, Copy, ExternalLink, Flag,
  Heart, HelpCircle, Lightbulb, Mail, MapPin, MessageCircle, Phone, Share2, ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScoreBadge } from "@/components/ScoreBadge";
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

export const Route = createFileRoute("/car/$id")({ component: CarDetail });

const DOC_LABELS: Record<string, string> = {
  proprio: "Próprio nome", terceiro: "Nome de terceiro", falecido: "Proprietário falecido",
  empresaExtinta: "Empresa extinta", desconhecido: "Desconhecido",
  nenhuma: "Nenhuma", "1a2": "1 a 2", "3oumais": "3 ou mais", naosei: "Não sei",
  emDia: "Em dia", isentoAntiguidade: "Isento (antiguidade)", atrasado: "Atrasado",
  naoSeAplica: "Não se aplica", nuncaLicenciadoEstado: "Nunca licenciado", sucata: "Sucata", semPlaca: "Sem placa",
  visivelLegivel: "Visível e legível", parcialmenteLegivel: "Parcialmente legível",
  ilegivel: "Ilegível", recarimbado: "Recarimbado", naoLocalizado: "Não localizado",
  original: "Original", trocadoMesmaFamilia: "Trocado (mesma família)", trocadoDiferente: "Trocado (diferente)", semNumero: "Sem número",
  comMultas: "Com multas", naoVerificado: "Não verificado", sim: "Sim", parcialmente: "Parcialmente", nao: "Não",
};

function DocIcon({ val }: { val: string }) {
  const ok = ["proprio", "nenhuma", "emDia", "isentoAntiguidade", "visivelLegivel", "original", "naoSeAplica", "sim"];
  const warn = ["terceiro", "1a2", "atrasado", "parcialmenteLegivel", "trocadoMesmaFamilia", "comMultas", "parcialmente"];
  if (ok.includes(val)) return <CheckCircle2 className="h-4 w-4 text-[color:var(--color-cat-complete)]" aria-hidden="true" />;
  if (warn.includes(val)) return <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden="true" />;
  return <HelpCircle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />;
}

function VerBadge({ badge }: { badge: string }) {
  if (badge === "verificada") return <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700"><CheckCircle2 className="h-3 w-3" /> Localização verificada</span>;
  if (badge === "provavel") return <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700"><AlertTriangle className="h-3 w-3" /> Localização provável</span>;
  if (badge === "divergencia") return <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700"><AlertTriangle className="h-3 w-3" /> Divergência detectada</span>;
  return <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">Sem dados de verificação</span>;
}

function CarDetail() {
  const { id } = useParams({ from: "/car/$id" });
  const { listings, users } = useAppStore();
  const user = useCurrentUser();
  const { toggle, isFavorited } = useFavoritesStore();
  const listing = listings.find((l) => l.id === id);
  const [showEstimador, setShowEstimador] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportNote, setReportNote] = useState("");
  const [showPhone, setShowPhone] = useState(false);

  if (!listing) {
    return (
      <div>
        <Header />
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="font-serif text-2xl">Anúncio não encontrado</h2>
          <Button asChild className="mt-6"><Link to="/">Voltar</Link></Button>
        </div>
      </div>
    );
  }

  const seller = users.find((u) => u.id === listing.sellerId);
  const photos = listing.photos.length > 0 ? listing.photos : Array(5).fill(null);
  const color = CATEGORY_COLORS[listing.category];
  const favorited = user ? isFavorited(user.id, listing.id) : false;
  const similares = listings.filter((l) => l.brand === listing.brand && l.id !== listing.id && l.status === "ativo").slice(0, 6);
  const sit = listing.situacaoDocumental;

  // Estimador
  const ipvaCusto = sit.ipva === "atrasado" && sit.ipvaAnosAtraso
    ? Math.round((listing.price ?? 30000) * 0.04 * sit.ipvaAnosAtraso)
    : 0;
  const totalEstimado = ipvaCusto + 400 + 180 + 250;

  return (
    <div className="min-h-screen">
      <Header />
      <main id="main-content" className="mx-auto max-w-6xl px-6 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>

        {/* Gallery */}
        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <div className="md:col-span-4 flex aspect-[16/9] items-center justify-center rounded-[10px] border border-border bg-secondary overflow-hidden">
            {photos[0] ? <img src={photos[0]} alt={listing.title} className="h-full w-full object-cover" /> : <Car className="h-24 w-24 text-muted-foreground/40" strokeWidth={1.2} />}
          </div>
          {photos.slice(0, 4).map((p, i) => (
            <div key={i} className="flex aspect-[4/3] items-center justify-center rounded-[10px] border border-border bg-secondary overflow-hidden">
              {p ? <img src={p} alt="" className="h-full w-full object-cover" /> : <Car className="h-8 w-8 text-muted-foreground/30" />}
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-10 md:grid-cols-3">
          {/* Left column */}
          <div className="md:col-span-2 space-y-8">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white" style={{ backgroundColor: color }}>
                  {CATEGORY_LABELS[listing.category]}
                </span>
                <span className="text-sm text-muted-foreground">{listing.year}</span>
                <VerBadge badge={listing.verificacaoLocalizacao.badge} />
                {user && (
                  <button onClick={() => toggle(user.id, listing.id)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                    <Heart className={cn("h-4 w-4", favorited && "fill-[color:var(--color-terracotta)] text-[color:var(--color-terracotta)]")} />
                    {favorited ? "Salvo" : "Salvar"}
                  </button>
                )}
              </div>
              <h1 className="mt-3 font-serif text-4xl">{listing.title}</h1>
              <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {listing.city}, {listing.state}
              </p>
              <p className="mt-6 font-serif text-3xl">{formatPrice(listing.price)}</p>

              {/* Score */}
              <div className="mt-2 flex items-center gap-3 flex-wrap">
                <ScoreBadge score={listing.scoreConfianca} />
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
              <h2 className="font-serif text-xl">Especificações</h2>
              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 rounded-[10px] border border-border bg-card p-5 text-sm md:grid-cols-4">
                {[
                  ["Ano", listing.year], ["Marca", listing.brand], ["Modelo", listing.model], ["Motor", listing.engine],
                  ["Cor", listing.color], ["Quilometragem", listing.km ? formatKm(listing.km) : "—"],
                  ["Chassi", listing.chassi], ["Documento", listing.documento],
                ].map(([k, v]) => (
                  <div key={k as string}>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">{k}</dt>
                    <dd className="mt-0.5 font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Dossiê Documental */}
            <div className="rounded-[10px] border-2 border-[color:var(--color-terracotta)] p-5">
              <h2 className="font-serif text-xl mb-4">Dossiê Documental</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  ["Documento em nome de", sit.documentoNome],
                  ["Transferências acumuladas", sit.transferenciasAcumuladas],
                  ["IPVA", sit.ipva + (sit.ipvaAnosAtraso ? ` (${sit.ipvaAnosAtraso} anos)` : "")],
                  ["Licenciamento", sit.licenciamento],
                  ["Chassi", sit.chassi],
                  ["Motor", sit.motor],
                  ["Multas", sit.multas + (sit.multasValor ? ` — R$ ${sit.multasValor}` : "")],
                  ["Aceita ajudar regularização", sit.aceitaAjudarRegularizacao],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 leading-none"><DocIcon val={v.split(" ")[0]} /></span>
                    <div>
                      <dt className="text-xs text-muted-foreground uppercase tracking-wide">{k}</dt>
                      <dd className="font-medium">{DOC_LABELS[v.split(" ")[0]] ?? v}</dd>
                    </div>
                  </div>
                ))}
              </div>
              {sit.documentosFisicos.length > 0 && (
                <div className="mt-4 text-sm">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">Documentos físicos: </span>
                  {sit.documentosFisicos.join(", ")}
                </div>
              )}
              {[sit.ipva === "atrasado", sit.licenciamento === "atrasado", sit.chassi !== "visivelLegivel"].some(Boolean) && (
                <div className="mt-4 rounded-[8px] bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800 flex items-start gap-2">
                  <HelpCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Pendências documentais são comuns em veículos com mais de 25 anos. Considere os custos de regularização ao negociar.</span>
                </div>
              )}
              <p className="mt-3 text-xs text-muted-foreground">Declarado pelo vendedor — não verificado pela plataforma</p>
            </div>

            {/* Estimador */}
            <div className="rounded-[10px] border border-border">
              <button
                onClick={() => setShowEstimador((v) => !v)}
                className="flex w-full items-center justify-between p-4 text-sm font-medium"
              >
                <span>Estimar custos de regularização</span>
                {showEstimador ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {showEstimador && (
                <div className="border-t border-border p-4 space-y-2 text-sm">
                  {ipvaCusto > 0 && <div className="flex justify-between"><span>IPVA atrasado ({sit.ipvaAnosAtraso} anos)</span><span>~{formatPrice(ipvaCusto)}</span></div>}
                  <div className="flex justify-between"><span>Licenciamento + DUT</span><span>~R$ 400</span></div>
                  <div className="flex justify-between"><span>Transferência de propriedade</span><span>~R$ 180</span></div>
                  <div className="flex justify-between"><span>Vistoria cautelar</span><span>~R$ 250</span></div>
                  <div className="flex justify-between border-t pt-2 font-semibold text-[color:var(--color-terracotta)]">
                    <span>Total estimado</span><span>~{formatPrice(totalEstimado)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground pt-1 flex items-center gap-1"><Lightbulb className="h-3 w-3" /> Use este valor como argumento na negociação</p>
                </div>
              )}
            </div>

            {/* Descrição */}
            <div>
              <h2 className="font-serif text-xl">Descrição</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/80">{listing.description}</p>
              <Link to="/compra-segura" className="mt-3 inline-flex items-center gap-1 text-xs text-[color:var(--color-terracotta)] hover:underline">
                → Guia de compra segura <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

            {/* Similares */}
            {similares.length > 0 && (
              <div>
                <h2 className="font-serif text-xl mb-4">Veículos similares</h2>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {similares.map((s) => (
                    <Link key={s.id} to="/car/$id" params={{ id: s.id }}
                      className="flex-shrink-0 w-48 rounded-[10px] border border-border bg-card overflow-hidden hover:border-foreground/30 transition-colors">
                      <div className="flex aspect-[4/3] items-center justify-center bg-secondary">
                        <Car className="h-10 w-10 text-muted-foreground/40" strokeWidth={1.2} />
                      </div>
                      <div className="p-3">
                        <p className="font-serif text-sm leading-tight">{s.title}</p>
                        <p className="mt-1 text-xs font-semibold">{formatPrice(s.price)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Report */}
            <button onClick={() => setReportOpen(true)} className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
              <Flag className="h-3.5 w-3.5" /> Denunciar anúncio
            </button>
          </div>

          {/* Right sticky column */}
          <aside className="md:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Seller card */}
              <div className="rounded-[10px] border border-border bg-card p-5">
                {seller && (
                  <>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-secondary font-serif">{seller.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <Link to="/perfil/$id" params={{ id: seller.id }} className="font-serif text-base hover:underline">{seller.name}</Link>
                        <p className="text-xs text-muted-foreground">Membro desde {formatDate(seller.memberSince)}</p>
                      </div>
                    </div>
                    {/* Verification badges */}
                    <div className="mt-3 flex gap-1 flex-wrap">
                      {seller.verificacoes.email && <Badge variant="secondary" className="text-[10px] gap-1"><Mail className="h-3 w-3" /> E-mail</Badge>}
                      {seller.verificacoes.telefone && <Badge variant="secondary" className="text-[10px] gap-1"><Phone className="h-3 w-3" /> Tel</Badge>}
                      {seller.verificacoes.cpf && <Badge variant="secondary" className="text-[10px] gap-1"><BadgeCheck className="h-3 w-3" /> CPF</Badge>}
                      {seller.verificacoes.kyc && <Badge className="text-[10px] bg-yellow-100 text-yellow-800 border-yellow-300 gap-1"><ShieldCheck className="h-3 w-3" /> Verificado</Badge>}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <span>Taxa resposta: <strong className="text-foreground">{seller.taxaResposta}%</strong></span>
                      <span>Responde: <strong className="text-foreground">{seller.tempoMedioResposta}</strong></span>
                      <span>Carros vendidos: <strong className="text-foreground">{seller.carrosVendidos}</strong></span>
                    </div>
                  </>
                )}
                <div className="mt-5 flex flex-col gap-2">
                  <Button
                    className="bg-[color:var(--color-terracotta)] text-white hover:bg-[color:var(--color-terracotta-dark)]"
                    onClick={() => {
                      if (!seller?.verificacoes.telefone) {
                        toast.warning("Vendedor sem telefone verificado");
                        return;
                      }
                      setShowPhone((v) => !v);
                    }}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {showPhone ? seller?.phone ?? "—" : "Ver telefone"}
                    {showPhone && <Copy className="h-3 w-3 ml-2 cursor-pointer" onClick={() => { navigator.clipboard.writeText(seller?.phone ?? ""); toast.success("Copiado!"); }} />}
                  </Button>
                  <Button asChild variant="outline" className="border-[color:var(--color-terracotta)] text-[color:var(--color-terracotta)] hover:bg-[color:var(--color-terracotta)]/5">
                    <Link to="/chat"><MessageCircle className="h-4 w-4 mr-2" /> Enviar mensagem</Link>
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="flex-1 text-xs" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copiado!"); }}>
                      <Copy className="h-3.5 w-3.5 mr-1" /> Copiar link
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1 text-xs" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(window.location.href)}`)}>
                      <Share2 className="h-3.5 w-3.5 mr-1" /> WhatsApp
                    </Button>
                  </div>
                </div>
              </div>

            </div>
          </aside>
        </div>
      </main>

      {/* Report modal */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Denunciar anúncio</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {["Anúncio duplicado", "Informações falsas", "Veículo não existe", "Golpe", "Outro"].map((r) => (
              <label key={r} className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="reason" value={r} checked={reportReason === r} onChange={() => setReportReason(r)} className="accent-[color:var(--color-terracotta)]" />
                <span className="text-sm">{r}</span>
              </label>
            ))}
            <Textarea placeholder="Observações adicionais (opcional)" rows={3} value={reportNote} onChange={(e) => setReportNote(e.target.value)} />
            <Button
              className="w-full bg-[color:var(--color-terracotta)] text-white"
              onClick={() => { toast.success("Denúncia enviada. Obrigado!"); setReportOpen(false); setReportReason(""); setReportNote(""); }}
              disabled={!reportReason}
            >
              Enviar denúncia
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

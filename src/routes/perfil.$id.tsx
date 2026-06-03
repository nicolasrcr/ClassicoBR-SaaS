import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Star, Flag, ShieldCheck, TrendingUp, MessageCircle, Car } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CarCard } from "@/components/CarCard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/store/app-store";
import { mockReviews } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";
import { sellerScoreLabel } from "@/lib/scores";

export const Route = createFileRoute("/perfil/$id")({ component: PerfilVendedor });

function Stars({ n, size = "sm" }: { n: number; size?: "sm" | "xs" }) {
  const sz = size === "xs" ? "h-2.5 w-2.5" : "h-3.5 w-3.5";
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${sz} ${i <= n ? "fill-amber-400 text-amber-400" : "text-muted-foreground/25"}`}
        />
      ))}
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  let barColor = "bg-[#1D6E4E]";
  if (score < 60) barColor = "bg-red-500";
  else if (score < 75) barColor = "bg-amber-500";
  return (
    <div className="flex items-center gap-3 w-full max-w-xs">
      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-semibold tabular-nums">{score}/100</span>
    </div>
  );
}

function StarsFromScore(score: number): number {
  // Map 0-100 to 1-5
  return Math.max(1, Math.min(5, Math.round((score / 100) * 5)));
}

function PerfilVendedor() {
  const { id } = Route.useParams();
  const { users, listings } = useAppStore();
  const seller = users.find((u) => u.id === id);
  const reviews = mockReviews.filter((r) => r.vendedorId === id);
  const sellerListings = listings.filter((l) => l.sellerId === id && l.status === "ativo");
  const [reportSent, setReportSent] = useState(false);

  if (!seller) {
    return (
      <div className="min-h-screen bg-[#FAF9F6]">
        <Header />
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <Car className="h-14 w-14 mx-auto mb-6 text-muted-foreground/30" />
          <h2 className="font-serif text-2xl mb-3">Vendedor não encontrado</h2>
          <p className="text-muted-foreground text-sm mb-8">
            O perfil que você procura não existe ou foi removido.
          </p>
          <Link to="/anuncios" className="text-sm text-[color:var(--color-terracotta)] hover:underline">
            ← Voltar aos anúncios
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const scoreInfo = sellerScoreLabel(seller.sellerScore);
  const starRating = StarsFromScore(seller.sellerScore);
  const avgReview =
    reviews.length > 0
      ? reviews.reduce(
          (a, r) =>
            a + (r.criterios.honestidade + r.criterios.comunicacao + r.criterios.veiculoComoDescrito) / 3,
          0,
        ) / reviews.length
      : null;

  const isNewSeller = seller.id === "u5" || (seller.verificacoes.email && !seller.verificacoes.telefone && !seller.verificacoes.cpf && !seller.verificacoes.kyc);
  const memberSinceYear = seller.memberSince ? new Date(seller.memberSince).getFullYear() : null;

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Header />
      <main id="main-content" className="mx-auto max-w-4xl px-6 py-10">

        {/* Low-reputation warning */}
        {seller.sellerScore < 60 && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800 text-sm">⚠️ Vendedor com baixa reputação</p>
              <p className="text-amber-700 text-xs mt-0.5">
                Este perfil apresenta pontuação abaixo de 60/100. Tome cuidado redobrado ao negociar e
                siga nosso <Link to="/compra-segura" className="underline">guia de compra segura</Link>.
              </p>
            </div>
          </div>
        )}

        {/* Profile header card */}
        <div className="rounded-xl border border-[#E8E6E0] bg-white p-6 md:p-8 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <Avatar className="h-24 w-24 shrink-0">
              <AvatarFallback className="bg-[color:var(--color-terracotta)]/10 font-serif text-3xl font-semibold text-[color:var(--color-terracotta)]">
                {seller.name[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              {/* Name + new badge */}
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="font-serif text-2xl md:text-3xl">{seller.name}</h1>
                {isNewSeller && (
                  <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-300">
                    Vendedor novo ⚠️
                  </Badge>
                )}
                {seller.status === "suspenso" && (
                  <Badge variant="destructive" className="text-xs">Suspenso</Badge>
                )}
                {seller.status === "banido" && (
                  <Badge variant="destructive" className="text-xs">Banido</Badge>
                )}
              </div>

              {/* City + member since */}
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                <MapPin className="h-3.5 w-3.5" />
                {seller.city}, {seller.state}
                {memberSinceYear && (
                  <>
                    <span className="mx-1 opacity-40">·</span>
                    <span>Membro desde {memberSinceYear}</span>
                  </>
                )}
              </p>

              {/* Verification badges */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {seller.verificacoes.email && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <span>📧</span> E-mail verificado
                  </Badge>
                )}
                {seller.verificacoes.telefone && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <span>📱</span> Telefone verificado
                  </Badge>
                )}
                {seller.verificacoes.cpf && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <span>🪪</span> CPF verificado
                  </Badge>
                )}
                {seller.verificacoes.kyc && (
                  <Badge className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300 gap-1">
                    <span>🏅</span> Identidade verificada (KYC)
                  </Badge>
                )}
              </div>

              {/* Score */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Stars n={starRating} size="sm" />
                  <span className={`text-sm font-semibold ${scoreInfo.color}`}>
                    {scoreInfo.label}
                  </span>
                </div>
                <ScoreBar score={seller.sellerScore} />
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[#E8E6E0]">
            <div className="text-center">
              <p className="text-2xl font-bold">{reviews.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Avaliações</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{seller.taxaResposta}%</p>
              <p className="text-xs text-muted-foreground mt-0.5">Taxa de resposta</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{seller.carrosVendidos}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Vendas realizadas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{seller.tempoMedioResposta}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Tempo médio resposta</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="anuncios" className="w-full">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="anuncios" className="flex-1 sm:flex-none">
              Anúncios ativos ({sellerListings.length})
            </TabsTrigger>
            <TabsTrigger value="avaliacoes" className="flex-1 sm:flex-none">
              Avaliações ({reviews.length})
            </TabsTrigger>
          </TabsList>

          {/* Tab: Active listings */}
          <TabsContent value="anuncios" className="mt-6">
            {sellerListings.length === 0 ? (
              <div className="rounded-xl border border-[#E8E6E0] bg-white py-16 text-center shadow-sm">
                <Car className="h-10 w-10 mx-auto mb-4 text-muted-foreground/30" />
                <p className="font-serif text-lg mb-1">Nenhum anúncio ativo</p>
                <p className="text-muted-foreground text-sm">
                  Este vendedor não possui anúncios publicados no momento.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {sellerListings.map((l) => (
                  <CarCard key={l.id} listing={l} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab: Reviews */}
          <TabsContent value="avaliacoes" className="mt-6">
            {reviews.length === 0 ? (
              <div className="rounded-xl border border-[#E8E6E0] bg-white py-16 text-center shadow-sm">
                <Star className="h-10 w-10 mx-auto mb-4 text-muted-foreground/30" />
                <p className="font-serif text-lg mb-1">Nenhuma avaliação ainda</p>
                <p className="text-muted-foreground text-sm">
                  Este vendedor ainda não recebeu avaliações.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary bar */}
                {avgReview !== null && (
                  <div className="rounded-xl border border-[#E8E6E0] bg-white p-5 shadow-sm flex items-center gap-4">
                    <div className="text-center shrink-0">
                      <p className="text-3xl font-bold">{avgReview.toFixed(1)}</p>
                      <Stars n={Math.round(avgReview)} size="sm" />
                      <p className="text-xs text-muted-foreground mt-1">{reviews.length} avaliação{reviews.length !== 1 ? "ões" : ""}</p>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {(["Honestidade", "Comunicação", "Veículo como descrito"] as const).map((label, idx) => {
                        const keys: ("honestidade" | "comunicacao" | "veiculoComoDescrito")[] = ["honestidade", "comunicacao", "veiculoComoDescrito"];
                        const avg = reviews.reduce((a, r) => a + r.criterios[keys[idx]], 0) / reviews.length;
                        return (
                          <div key={label} className="flex items-center gap-2 text-xs">
                            <span className="w-36 text-muted-foreground shrink-0">{label}</span>
                            <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                              <div
                                className="h-full rounded-full bg-amber-400"
                                style={{ width: `${(avg / 5) * 100}%` }}
                              />
                            </div>
                            <span className="font-medium w-6 text-right">{avg.toFixed(1)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Individual reviews */}
                {reviews.map((r) => {
                  const avg = (r.criterios.honestidade + r.criterios.comunicacao + r.criterios.veiculoComoDescrito) / 3;
                  return (
                    <div key={r.id} className="rounded-xl border border-[#E8E6E0] bg-white p-5 shadow-sm space-y-4">
                      {/* Reviewer info + rating */}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-secondary">{r.reviewerNome[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm leading-tight">{r.reviewerNome}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(r.data)}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <Stars n={Math.round(avg)} size="sm" />
                          <span className="text-xs text-muted-foreground">{avg.toFixed(1)}/5</span>
                        </div>
                      </div>

                      {/* 3 criteria */}
                      <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-secondary/40">
                        {(
                          [
                            ["Honestidade", r.criterios.honestidade],
                            ["Comunicação", r.criterios.comunicacao],
                            ["Veículo", r.criterios.veiculoComoDescrito],
                          ] as [string, number][]
                        ).map(([label, val]) => (
                          <div key={label} className="text-center">
                            <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
                            <Stars n={val} size="xs" />
                            <p className="text-xs font-medium mt-0.5">{val}/5</p>
                          </div>
                        ))}
                      </div>

                      {/* Comment */}
                      <p className="text-sm text-foreground/80 leading-relaxed">{r.comentario}</p>

                      {/* Seller reply */}
                      {r.respostaVendedor && (
                        <div className="rounded-lg bg-[color:var(--color-terracotta)]/5 border border-[color:var(--color-terracotta)]/15 p-4 border-l-2 border-l-[color:var(--color-terracotta)]">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageCircle className="h-3.5 w-3.5 text-[color:var(--color-terracotta)]" />
                            <p className="text-xs font-semibold text-[color:var(--color-terracotta)]">Resposta do vendedor</p>
                          </div>
                          <p className="text-sm text-foreground/80">{r.respostaVendedor}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Report user */}
        <div className="mt-10 pt-6 border-t border-[#E8E6E0] flex justify-center">
          {reportSent ? (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#1D6E4E]" />
              Denúncia enviada. Nossa equipe irá analisar em breve.
            </p>
          ) : (
            <button
              onClick={() => setReportSent(true)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-500 transition-colors"
            >
              <Flag className="h-3.5 w-3.5" />
              Denunciar usuário
            </button>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

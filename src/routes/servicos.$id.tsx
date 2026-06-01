import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Phone, MessageCircle, Globe, Tag } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TraceabilityPanel } from "@/components/TraceabilityPanel";
import { ReportDialog, AuditTrailCard } from "@/components/ReportDialog";
import { useAppStore, useCurrentUser } from "@/store/app-store";
import { SERVICE_KIND_LABELS } from "@/lib/types";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/servicos/$id")({ component: ServicoDetail });

function ServicoDetail() {
  const { id } = useParams({ from: "/servicos/$id" });
  const s = useAppStore((st) => st.services.find((x) => x.id === id));
  const user = useCurrentUser();
  const router = useRouter();
  const canSeeAudit = user && (user.role === "admin" || user.id === s?.anuncianteId);

  if (!s) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="mx-auto max-w-3xl flex-1 px-6 py-20 text-center">
          <h1 className="font-serif text-2xl">Anúncio não encontrado</h1>
          <Link to="/servicos" className="mt-4 inline-block text-sm text-[color:var(--color-terracotta)] hover:underline">← Voltar</Link>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    const goBack = () => {
      if (typeof window !== "undefined" && window.history.length > 1) {
        router.history.back();
      } else {
        router.navigate({ to: "/servicos" });
      }
    };
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <LockedContentGate
          title={s.titulo}
          subtitle={`${s.cidade}/${s.estado}`}
          photo={s.fotos[0]}
          redirectTo={`/servicos/${s.id}`}
          kind="serviço"
          onBack={goBack}
        />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <Link to="/servicos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-3 w-3" /> Voltar para serviços
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 overflow-hidden rounded-xl border border-border bg-card">
            <div className="aspect-[16/9] bg-muted overflow-hidden">
              <img src={s.fotos[0]} alt={s.titulo} className="h-full w-full object-cover" />
            </div>
            <div className="p-6">
              <span className="rounded-full bg-[color:var(--color-terracotta)]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-terracotta)]">
                {SERVICE_KIND_LABELS[s.kind]}
              </span>
              <h1 className="mt-3 font-serif text-3xl leading-tight">{s.titulo}</h1>
              <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{s.cidade}/{s.estado}{s.endereco ? ` — ${s.endereco}` : ""}</p>

              <p className="mt-5 price-tag text-3xl text-[color:var(--color-terracotta)]">
                {s.preco == null ? "Sob consulta" : formatPrice(s.preco)}
              </p>

              <div className="mt-6">
                <h2 className="font-serif text-lg mb-2">Descrição</h2>
                <p className="text-sm leading-relaxed whitespace-pre-line">{s.descricao}</p>
              </div>

              {s.especialidades.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Especialidades</p>
                  <div className="flex flex-wrap gap-2">
                    {s.especialidades.map((e) => (
                      <span key={e} className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs">
                        <Tag className="h-3 w-3" /> {e}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-2">
                {s.whatsapp && (
                  <a
                    href={`https://wa.me/55${s.whatsapp.replace(/\D/g, "")}`}
                    target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg btn-terra px-5 py-2.5 text-sm font-semibold text-white"
                  >
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                )}
                {s.telefone && (
                  <a href={`tel:${s.telefone}`} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold hover:bg-muted">
                    <Phone className="h-4 w-4" /> {s.telefone}
                  </a>
                )}
                {s.site && (
                  <a href={s.site} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold hover:bg-muted">
                    <Globe className="h-4 w-4" /> Site
                  </a>
                )}
                <ReportDialog tipoAlvo="servico" alvoId={s.id} />
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Anunciante</p>
              <p className="font-serif text-lg mt-1">{s.anuncianteNome}</p>
              <p className="text-xs text-muted-foreground mt-1">Publicado em {new Date(s.createdAt).toLocaleDateString("pt-BR")}</p>
            </div>
            <TraceabilityPanel trace={s.rastreabilidade} />
            {canSeeAudit && <AuditTrailCard entries={s.trilhaAuditoria} />}
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
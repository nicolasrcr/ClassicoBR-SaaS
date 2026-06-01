import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Clock, MapPin, Ticket, Users, Phone, Instagram, Globe, Star, ListOrdered, Sparkles, Handshake, FileText, Info as InfoIcon } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TraceabilityPanel } from "@/components/TraceabilityPanel";
import { ReportDialog, AuditTrailCard } from "@/components/ReportDialog";
import { ContactLeadDialog } from "@/components/ContactLeadDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore, useCurrentUser } from "@/store/app-store";
import { TIPO_EVENTO_LABELS } from "@/lib/types";

export const Route = createFileRoute("/eventos/$id")({ component: EventoDetail });

function EventoDetail() {
  const { id } = useParams({ from: "/eventos/$id" });
  const event = useAppStore((s) => s.events.find((e) => e.id === id));
  const user = useCurrentUser();
  const canSeeAudit = user && (user.role === "admin" || user.id === event?.organizadorId);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 350);
    return () => clearTimeout(timer);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
          <Skeleton className="h-4 w-32 mb-4" />
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <Skeleton className="aspect-[21/9] w-full" />
            <div className="p-6 md:p-8 space-y-4">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-48" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
              <div className="flex gap-3 pt-4">
                <Skeleton className="h-10 w-32 rounded-lg" />
                <Skeleton className="h-10 w-32 rounded-lg" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="mx-auto max-w-3xl flex-1 px-6 py-20 text-center">
          <h1 className="font-serif text-2xl">Evento não encontrado</h1>
          <Link to="/eventos" className="mt-4 inline-block text-sm text-[color:var(--color-terracotta)] hover:underline">← Voltar para a agenda</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        <Link to="/eventos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-3 w-3" /> Voltar para eventos
        </Link>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="aspect-[21/9] overflow-hidden bg-muted">
            <img src={event.capa} alt={event.titulo} className="h-full w-full object-cover" />
          </div>
          <div className="p-6 md:p-8">
            <span className="rounded-full bg-[color:var(--color-terracotta)]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-terracotta)]">
              {TIPO_EVENTO_LABELS[event.tipo]}
            </span>
            <h1 className="mt-3 font-serif text-3xl md:text-4xl leading-tight">{event.titulo}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Organizado por {event.organizadorNome}</p>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <Info icon={Calendar} label="Quando" value={fmt(event.dataInicio, event.dataFim)} />
              <Info icon={MapPin} label="Onde" value={`${event.cidade}/${event.estado}`} />
              <Info icon={Ticket} label="Entrada" value={event.precoEntrada == null ? "Gratuito" : `R$ ${event.precoEntrada}`} />
              {event.publicoEsperado && <Info icon={Users} label="Público esperado" value={`${event.publicoEsperado.toLocaleString("pt-BR")}`} />}
            </div>

            <div className="mt-6 rounded-lg border border-border bg-background p-4 text-sm">
              <p className="font-semibold mb-1">Endereço</p>
              <p className="text-muted-foreground">{event.endereco}</p>
            </div>

            <div className="mt-6">
              <h2 className="font-serif text-xl mb-2">Sobre o evento</h2>
              <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">{event.descricao}</p>
            </div>

            {event.contato && (
              <div className="mt-6 flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-[color:var(--color-terracotta)]" />
                <span className="font-semibold">Contato:</span> <span>{event.contato}</span>
              </div>
            )}

            {(event.horario || event.ingressoUrl || event.instagram || event.site) && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {event.horario && (
                  <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-[color:var(--color-terracotta)]" /><span>{event.horario}</span></div>
                )}
                {event.ingressoUrl && (
                  <a href={event.ingressoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[color:var(--color-terracotta)] hover:underline">
                    <Ticket className="h-4 w-4" /> Garantir ingresso
                  </a>
                )}
                {event.instagram && (
                  <a href={event.instagram.startsWith("http") ? event.instagram : `https://instagram.com/${event.instagram.replace(/^@/, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:underline">
                    <Instagram className="h-4 w-4 text-[color:var(--color-terracotta)]" /> {event.instagram}
                  </a>
                )}
                {event.site && (
                  <a href={event.site} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:underline">
                    <Globe className="h-4 w-4 text-[color:var(--color-terracotta)]" /> Site oficial
                  </a>
                )}
              </div>
            )}

            {event.destaques && event.destaques.length > 0 && (
              <Section icon={Sparkles} title="Destaques">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                  {event.destaques.map((d) => (
                    <li key={d} className="flex items-start gap-2"><Star className="h-3.5 w-3.5 mt-1 text-[color:var(--color-terracotta)] shrink-0" /><span>{d}</span></li>
                  ))}
                </ul>
              </Section>
            )}

            {event.programacao && event.programacao.length > 0 && (
              <Section icon={ListOrdered} title="Programação">
                <ul className="divide-y divide-border rounded-lg border border-border overflow-hidden">
                  {event.programacao.map((p, i) => (
                    <li key={i} className="flex items-center gap-3 px-3 py-2 text-sm bg-background">
                      {p.hora && <span className="font-mono text-xs px-2 py-0.5 rounded bg-[color:var(--color-terracotta)]/10 text-[color:var(--color-terracotta)] shrink-0">{p.hora}</span>}
                      <span>{p.atividade}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {event.atracoes && event.atracoes.length > 0 && (
              <Section icon={Users} title="Atrações / Clubes convidados">
                <div className="flex flex-wrap gap-2">
                  {event.atracoes.map((a) => (
                    <span key={a} className="rounded-full bg-secondary px-3 py-1 text-xs">{a}</span>
                  ))}
                </div>
              </Section>
            )}

            {event.patrocinadores && event.patrocinadores.length > 0 && (
              <Section icon={Handshake} title="Patrocinadores e parceiros">
                <div className="flex flex-wrap gap-2">
                  {event.patrocinadores.map((p) => (
                    <span key={p} className="rounded-md border border-border bg-background px-3 py-1 text-xs">{p}</span>
                  ))}
                </div>
              </Section>
            )}

            {event.regras && (
              <Section icon={FileText} title="Regras / Requisitos">
                <p className="text-sm leading-relaxed whitespace-pre-line text-foreground/90">{event.regras}</p>
              </Section>
            )}

            {event.observacoes && (
              <Section icon={InfoIcon} title="Observações">
                <p className="text-sm leading-relaxed whitespace-pre-line text-foreground/90">{event.observacoes}</p>
              </Section>
            )}

            <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-4">
              <ContactLeadDialog
                kind="evento"
                contextTitle={event.titulo}
                recipientName={event.organizadorNome}
                whatsapp={event.contato}
                triggerLabel="Tenho interesse"
              />
              {event.ingressoUrl && (
                <a href={event.ingressoUrl} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold hover:bg-muted">
                  <Ticket className="h-4 w-4" /> Comprar ingresso
                </a>
              )}
              <ReportDialog tipoAlvo="evento" alvoId={event.id} />
            </div>

            {canSeeAudit && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.rastreabilidade && <TraceabilityPanel trace={event.rastreabilidade} />}
                <AuditTrailCard entries={event.trilhaAuditoria} />
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[color:var(--color-terracotta)]/10">
        <Icon className="h-4 w-4 text-[color:var(--color-terracotta)]" />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="flex items-center gap-2 font-serif text-lg mb-2">
        <Icon className="h-4 w-4 text-[color:var(--color-terracotta)]" /> {title}
      </h3>
      {children}
    </section>
  );
}

function fmt(ini: string, fim?: string) {
  const f = (s: string) => new Date(s + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  return fim ? `${f(ini)} → ${f(fim)}` : f(ini);
}
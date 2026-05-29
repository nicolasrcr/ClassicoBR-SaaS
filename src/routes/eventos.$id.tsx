import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Calendar, MapPin, Ticket, Users, Phone } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAppStore } from "@/store/app-store";
import { TIPO_EVENTO_LABELS } from "@/lib/types";

export const Route = createFileRoute("/eventos/$id")({ component: EventoDetail });

function EventoDetail() {
  const { id } = useParams({ from: "/eventos/$id" });
  const event = useAppStore((s) => s.events.find((e) => e.id === id));

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

function fmt(ini: string, fim?: string) {
  const f = (s: string) => new Date(s + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  return fim ? `${f(ini)} → ${f(fim)}` : f(ini);
}
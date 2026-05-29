import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Calendar, MapPin, Ticket, Plus, X, Upload, Search, ShieldCheck } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TraceabilityPanel } from "@/components/TraceabilityPanel";
import { useAppStore, useCurrentUser } from "@/store/app-store";
import { TIPO_EVENTO_LABELS, type TipoEvento, type ClassicEvent, type ImageTrace } from "@/lib/types";
import { analyzeImageFile, buildTraceability } from "@/lib/traceability";
import { scoreEventRelevance, normalizeText } from "@/lib/search";
import { BR_STATES } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/eventos")({
  head: () => ({
    meta: [
      { title: "Eventos, encontros e exposições de clássicos — ClassicosBR" },
      { name: "description", content: "Agenda de encontros, exposições, rallies e feiras de carros clássicos no Brasil." },
    ],
  }),
  component: EventosPage,
});

function EventosPage() {
  const events = useAppStore((s) => s.events);
  const addEvent = useAppStore((s) => s.addEvent);
  const user = useCurrentUser();
  const isAdmin = user?.role === "admin";

  const [search, setSearch] = useState("");
  const [cidade, setCidade] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<TipoEvento | "all">("all");
  const [estadoFiltro, setEstadoFiltro] = useState<string>("all");
  const [dataIni, setDataIni] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [sort, setSort] = useState<"relevancia" | "data-asc" | "data-desc">("relevancia");
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    const list = events
      .filter((e) => isAdmin || (e.statusModeracao ?? "aprovado") === "aprovado")
      .filter((e) => tipoFiltro === "all" || e.tipo === tipoFiltro)
      .filter((e) => estadoFiltro === "all" || e.estado === estadoFiltro)
      .filter((e) => !cidade || normalizeText(e.cidade).includes(normalizeText(cidade)))
      .filter((e) => !dataIni || e.dataInicio >= dataIni)
      .filter((e) => !dataFim || e.dataInicio <= dataFim)
      .filter((e) => !search.trim() || scoreEventRelevance(e, search) > 0);
    if (sort === "data-asc") return [...list].sort((a, b) => a.dataInicio.localeCompare(b.dataInicio));
    if (sort === "data-desc") return [...list].sort((a, b) => b.dataInicio.localeCompare(a.dataInicio));
    return [...list].sort((a, b) => scoreEventRelevance(b, search) - scoreEventRelevance(a, search));
  }, [events, isAdmin, tipoFiltro, estadoFiltro, cidade, dataIni, dataFim, search, sort]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="hero-dark px-6 py-14 md:py-20">
        <div className="mx-auto max-w-7xl relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 mb-5">
            <Calendar className="h-3.5 w-3.5 text-[color:var(--color-terracotta-light)]" />
            <span className="text-[11px] uppercase tracking-[0.15em] text-white/80">Agenda</span>
          </div>
          <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight">
            Encontros, exposições<br />
            <span className="italic text-[color:var(--color-terracotta-light)]">e rallies de clássicos</span>
          </h1>
          <p className="mt-4 max-w-xl text-white/70">
            Descubra eventos no Brasil inteiro — ou divulgue o seu próprio encontro para a comunidade.
          </p>
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10">
        <div className="mb-6 rounded-xl border border-border bg-card p-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar eventos por título, descrição ou local…" className="pl-9 h-10" />
              </div>
              <Button onClick={() => {
                if (!user) { toast.error("Faça login para divulgar um evento"); return; }
                setShowForm((v) => !v);
              }} className="btn-terra text-white">
                <Plus className="h-4 w-4" /> Divulgar evento
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
              <Select value={tipoFiltro} onValueChange={(v) => setTipoFiltro(v as TipoEvento | "all")}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {(Object.keys(TIPO_EVENTO_LABELS) as TipoEvento[]).map((t) => (
                    <SelectItem key={t} value={t}>{TIPO_EVENTO_LABELS[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo Brasil</SelectItem>
                  {BR_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Cidade" className="h-9" />
              <Input type="date" value={dataIni} onChange={(e) => setDataIni(e.target.value)} className="h-9" />
              <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="h-9" />
              <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevancia">Relevância</SelectItem>
                  <SelectItem value="data-asc">Data ↑</SelectItem>
                  <SelectItem value="data-desc">Data ↓</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {showForm && user && (
          <EventoForm
            onClose={() => setShowForm(false)}
            onSubmit={(e) => { addEvent(e); setShowForm(false); toast.success("Evento publicado e enviado para moderação!"); }}
            userId={user.id}
            userName={user.name}
          />
        )}

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
            Nenhum evento encontrado com esses filtros.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((ev) => (
              <Link key={ev.id} to="/eventos/$id" params={{ id: ev.id }} className="car-card group overflow-hidden rounded-xl border border-border bg-card flex flex-col">
                <div className="aspect-[16/10] overflow-hidden bg-muted">
                  <img src={ev.capa} alt={ev.titulo} className="car-card-img h-full w-full object-cover" loading="lazy" />
                </div>
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[color:var(--color-terracotta)]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-terracotta)]">
                      {TIPO_EVENTO_LABELS[ev.tipo]}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{formatDateRange(ev.dataInicio, ev.dataFim)}</span>
                  </div>
                  <h3 className="font-serif text-lg leading-tight">{ev.titulo}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{ev.descricao}</p>
                  <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{ev.cidade}/{ev.estado}</span>
                    <span className="flex items-center gap-1 font-semibold text-foreground">
                      <Ticket className="h-3 w-3" />
                      {ev.precoEntrada == null ? "Gratuito" : `R$ ${ev.precoEntrada}`}
                    </span>
                  </div>
                  {isAdmin && ev.statusModeracao && ev.statusModeracao !== "aprovado" && (
                    <span className="text-[10px] uppercase font-semibold text-amber-700">moderação: {ev.statusModeracao}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function EventoForm({ onClose, onSubmit, userId, userName }: {
  onClose: () => void;
  onSubmit: (e: ClassicEvent) => void;
  userId: string;
  userName: string;
}) {
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<TipoEvento>("encontro");
  const [descricao, setDescricao] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("SP");
  const [endereco, setEndereco] = useState("");
  const [precoEntrada, setPrecoEntrada] = useState("");
  const [contato, setContato] = useState("");
  const [imagens, setImagens] = useState<ImageTrace[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  const trace = useMemo(() => buildTraceability({ estadoAnuncio: estado, imagens }), [estado, imagens]);

  const onFiles = async (files: FileList | null) => {
    if (!files) return;
    setAnalyzing(true);
    try {
      const arr = await Promise.all(Array.from(files).slice(0, 6).map(analyzeImageFile));
      setImagens((cur) => [...cur, ...arr].slice(0, 6));
      toast.success(`${arr.length} imagem(ns) analisada(s)`);
    } catch {
      toast.error("Falha ao analisar imagens");
    } finally {
      setAnalyzing(false);
    }
  };

  const submit = () => {
    if (!titulo || !descricao || !dataInicio || !cidade || !endereco) {
      toast.error("Preencha os campos obrigatórios"); return;
    }
    if (trace.scoreOrigem < 50) {
      toast.error("Score de origem baixo — adicione mais fotos com EXIF antes de publicar"); return;
    }
    onSubmit({
      id: "ev_" + Date.now(),
      titulo, tipo, descricao,
      dataInicio, dataFim: dataFim || undefined,
      cidade, estado, endereco,
      organizadorId: userId, organizadorNome: userName,
      capa: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1200",
      precoEntrada: precoEntrada ? Number(precoEntrada) : null,
      contato: contato || undefined,
      status: "agendado",
      createdAt: new Date().toISOString().slice(0, 10),
      statusModeracao: "pendente",
      rastreabilidade: trace,
      trilhaAuditoria: [
        { acao: "evento_criado", autorId: userId, autorNome: userName, em: new Date().toISOString(), meta: { score: trace.scoreOrigem } },
      ],
    });
  };

  return (
    <div className="mb-6 rounded-xl border border-border bg-card p-6 relative">
      <button onClick={onClose} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
      <h2 className="font-serif text-xl mb-4">Divulgar novo evento</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label>Título *</Label>
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Encontro Mensal de Clássicos" />
          </div>
          <div>
            <Label>Tipo *</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as TipoEvento)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(TIPO_EVENTO_LABELS) as TipoEvento[]).map((t) => (
                  <SelectItem key={t} value={t}>{TIPO_EVENTO_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Preço (R$, vazio = gratuito)</Label>
            <Input type="number" value={precoEntrada} onChange={(e) => setPrecoEntrada(e.target.value)} />
          </div>
          <div>
            <Label>Data início *</Label>
            <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
          </div>
          <div>
            <Label>Data fim</Label>
            <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
          </div>
          <div>
            <Label>Cidade *</Label>
            <Input value={cidade} onChange={(e) => setCidade(e.target.value)} />
          </div>
          <div>
            <Label>Estado *</Label>
            <Select value={estado} onValueChange={setEstado}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{BR_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label>Endereço *</Label>
            <Input value={endereco} onChange={(e) => setEndereco(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label>Descrição *</Label>
            <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} />
          </div>
          <div className="md:col-span-2">
            <Label>Contato (telefone/WhatsApp)</Label>
            <Input value={contato} onChange={(e) => setContato(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label className="mb-1.5 block">Fotos (validamos metadados e origem)</Label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background px-4 py-6 text-sm text-muted-foreground hover:border-[color:var(--color-terracotta)] hover:text-foreground transition-colors">
              <Upload className="h-4 w-4" />
              {analyzing ? "Analisando…" : "Selecionar imagens (até 6)"}
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
            </label>
          </div>
        </div>
        <div className="md:col-span-1">
          <TraceabilityPanel trace={trace} />
          <p className="mt-3 text-[11px] text-muted-foreground">
            Publicações com <strong>score &lt; 50</strong> são bloqueadas. Toda submissão fica pendente até aprovação na fila de moderação.
          </p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2 justify-end">
        <span className="text-xs text-muted-foreground inline-flex items-center gap-1 mr-auto">
          <ShieldCheck className="h-3.5 w-3.5 text-[color:var(--color-cat-complete)]" />
          Score atual: <strong>{trace.scoreOrigem}/100</strong>
        </span>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button className="btn-terra text-white" onClick={submit} disabled={trace.scoreOrigem < 50}>Publicar evento</Button>
      </div>
    </div>
  );
}

function formatDateRange(ini: string, fim?: string) {
  const f = (s: string) => new Date(s + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  return fim ? `${f(ini)} → ${f(fim)}` : f(ini);
}

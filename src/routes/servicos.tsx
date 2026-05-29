import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Wrench, Package, Sparkles, ShoppingBag, MapPin, Plus, X, Upload, ShieldCheck, Search } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TraceabilityPanel } from "@/components/TraceabilityPanel";
import { useAppStore, useCurrentUser } from "@/store/app-store";
import { SERVICE_KIND_LABELS, type ServiceKind, type ServiceListing, type ImageTrace } from "@/lib/types";
import { analyzeImageFile, buildTraceability } from "@/lib/traceability";
import { scoreServiceRelevance, normalizeText } from "@/lib/search";
import { BR_STATES } from "@/lib/mock-data";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";

const KIND_ICONS: Record<ServiceKind, React.ElementType> = {
  oficina: Wrench,
  autopeca: Package,
  servico: Sparkles,
  pecaClassificado: ShoppingBag,
};

export const Route = createFileRoute("/servicos")({
  head: () => ({
    meta: [
      { title: "Oficinas, auto-peças e classificados de peças — ClassicosBR" },
      { name: "description", content: "Encontre oficinas especializadas, auto-peças e classificados de peças para carros clássicos. Origem validada por IP e metadados." },
    ],
  }),
  component: ServicosPage,
});

function ServicosPage() {
  const services = useAppStore((s) => s.services);
  const addService = useAppStore((s) => s.addService);
  const user = useCurrentUser();
  const isAdmin = user?.role === "admin";
  const [search, setSearch] = useState("");
  const [cidade, setCidade] = useState("");
  const [kindFilter, setKindFilter] = useState<ServiceKind | "all">("all");
  const [estadoFilter, setEstadoFilter] = useState<string>("all");
  const [sort, setSort] = useState<"relevancia" | "recente">("relevancia");
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    const list = services
      .filter((s) => s.status === "ativo")
      .filter((s) => isAdmin || (s.statusModeracao ?? "aprovado") === "aprovado")
      .filter((s) => kindFilter === "all" || s.kind === kindFilter)
      .filter((s) => estadoFilter === "all" || s.estado === estadoFilter)
      .filter((s) => !cidade || normalizeText(s.cidade).includes(normalizeText(cidade)))
      .filter((s) => !search.trim() || scoreServiceRelevance(s, search) > 0);
    if (sort === "recente") return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return [...list].sort((a, b) => scoreServiceRelevance(b, search) - scoreServiceRelevance(a, search));
  }, [services, isAdmin, kindFilter, estadoFilter, cidade, search, sort]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="hero-dark px-6 py-14 md:py-20">
        <div className="mx-auto max-w-7xl relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 mb-5">
            <Wrench className="h-3.5 w-3.5 text-[color:var(--color-terracotta-light)]" />
            <span className="text-[11px] uppercase tracking-[0.15em] text-white/80">Serviços & Peças</span>
          </div>
          <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight">
            Oficinas, auto-peças<br />
            <span className="italic text-[color:var(--color-terracotta-light)]">e classificados de peças</span>
          </h1>
          <p className="mt-4 max-w-xl text-white/70">
            Toda publicação aqui passa por validação de IP, fingerprint do navegador, metadados das imagens e hash SHA-256 para garantir a origem.
          </p>
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10">
        {/* tabs */}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-3">
          {(["all", "oficina", "autopeca", "servico", "pecaClassificado"] as const).map((k) => {
            const active = kindFilter === k;
            const label = k === "all" ? "Todos" : SERVICE_KIND_LABELS[k];
            const Icon = k === "all" ? Wrench : KIND_ICONS[k];
            return (
              <button
                key={k}
                onClick={() => setKindFilter(k)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold border transition-colors ${
                  active
                    ? "bg-[color:var(--color-charcoal)] text-white border-[color:var(--color-charcoal)]"
                    : "bg-card text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {label}
              </button>
            );
          })}
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar oficinas, peças, especialidades…" className="pl-9 h-9 bg-card" />
            </div>
            <Input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Cidade" className="h-9 sm:w-40 bg-card" />
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger className="h-9 sm:w-32 bg-card"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo Brasil</SelectItem>
                {BR_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
              <SelectTrigger className="h-9 sm:w-36 bg-card"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="relevancia">Relevância</SelectItem>
                <SelectItem value="recente">Mais recentes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => {
            if (!user) { toast.error("Faça login para publicar"); return; }
            setShowForm((v) => !v);
          }} className="btn-terra text-white">
            <Plus className="h-4 w-4" /> Publicar
          </Button>
        </div>

        {showForm && user && (
          <ServicoForm
            onClose={() => setShowForm(false)}
            onSubmit={(s) => { addService(s); setShowForm(false); toast.success("Publicado com rastreabilidade!"); }}
            userId={user.id}
            userName={user.name}
          />
        )}

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
            Nenhum anúncio nessa categoria ainda.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => {
              const Icon = KIND_ICONS[s.kind];
              return (
                <Link key={s.id} to="/servicos/$id" params={{ id: s.id }} className="car-card group overflow-hidden rounded-xl border border-border bg-card flex flex-col">
                  <div className="aspect-[16/10] overflow-hidden bg-muted relative">
                    <img src={s.fotos[0]} alt={s.titulo} className="car-card-img h-full w-full object-cover" loading="lazy" />
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/65 backdrop-blur px-2.5 py-1 text-[10px] font-semibold text-white">
                      <Icon className="h-3 w-3" /> {SERVICE_KIND_LABELS[s.kind]}
                    </span>
                    {s.rastreabilidade.scoreOrigem >= 80 && (
                      <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[color:var(--color-cat-complete)]/90 px-2 py-1 text-[10px] font-semibold text-white">
                        <ShieldCheck className="h-3 w-3" /> Origem validada
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <h3 className="font-serif text-base leading-tight line-clamp-2">{s.titulo}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{s.descricao}</p>
                    <div className="mt-auto flex items-center justify-between text-xs pt-2 border-t border-border">
                      <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-3 w-3" />{s.cidade}/{s.estado}</span>
                      <span className="price-tag text-sm">
                        {s.preco == null ? "Sob consulta" : formatPrice(s.preco)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function ServicoForm({ onClose, onSubmit, userId, userName }: {
  onClose: () => void;
  onSubmit: (s: ServiceListing) => void;
  userId: string;
  userName: string;
}) {
  const [kind, setKind] = useState<ServiceKind>("oficina");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [especialidades, setEspecialidades] = useState("");
  const [preco, setPreco] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("SP");
  const [endereco, setEndereco] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
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
    if (!titulo || !descricao || !cidade) { toast.error("Preencha título, descrição e cidade"); return; }
    if (trace.scoreOrigem < 50) { toast.error("Score de origem muito baixo — adicione mais fotos com EXIF"); return; }
    onSubmit({
      id: "sv_" + Date.now(),
      kind, titulo, descricao,
      especialidades: especialidades.split(",").map((s) => s.trim()).filter(Boolean),
      preco: preco ? Number(preco) : null,
      fotos: imagens.length > 0
        ? ["https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=900"]
        : ["https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=900"],
      cidade, estado, endereco: endereco || undefined,
      anuncianteId: userId, anuncianteNome: userName,
      whatsapp: whatsapp || undefined,
      status: "ativo",
      createdAt: new Date().toISOString().slice(0, 10),
      rastreabilidade: trace,
      scoreConfianca: trace.scoreOrigem,
      statusModeracao: "pendente",
      trilhaAuditoria: [
        { acao: "servico_criado", autorId: userId, autorNome: userName, em: new Date().toISOString(), meta: { score: trace.scoreOrigem } },
      ],
    });
  };

  return (
    <div className="mb-6 rounded-xl border border-border bg-card p-6 relative">
      <button onClick={onClose} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
      <h2 className="font-serif text-xl mb-4">Publicar serviço, peça ou loja</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div>
            <Label>Tipo *</Label>
            <Select value={kind} onValueChange={(v) => setKind(v as ServiceKind)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(SERVICE_KIND_LABELS) as ServiceKind[]).map((k) => (
                  <SelectItem key={k} value={k}>{SERVICE_KIND_LABELS[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Título *</Label>
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Restauração de motor 4cc Opala" />
          </div>
          <div>
            <Label>Descrição *</Label>
            <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
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
            <div>
              <Label>Preço (R$, vazio = sob consulta)</Label>
              <Input type="number" value={preco} onChange={(e) => setPreco(e.target.value)} />
            </div>
            <div>
              <Label>WhatsApp</Label>
              <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(00) 00000-0000" />
            </div>
          </div>
          <div>
            <Label>Endereço</Label>
            <Input value={endereco} onChange={(e) => setEndereco(e.target.value)} />
          </div>
          <div>
            <Label>Especialidades (separadas por vírgula)</Label>
            <Input value={especialidades} onChange={(e) => setEspecialidades(e.target.value)} placeholder="Opala, Maverick, VW ar" />
          </div>

          <div>
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
            O painel ao lado é gerado em tempo real conforme você adiciona imagens. Publicações com score &lt; 50 são bloqueadas.
          </p>
        </div>
      </div>

      <div className="mt-5 flex gap-2 justify-end">
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button className="btn-terra text-white" onClick={submit}>Publicar</Button>
      </div>
    </div>
  );
}
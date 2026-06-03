import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Check, Cog, ImageIcon, Trash2, Upload, Wrench, X, Search } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppStore, useCurrentUser } from "@/store/app-store";
import { BR_STATES } from "@/lib/mock-data";
import type { Category, Listing } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/types";
import { formatPrice } from "@/lib/format";


export const Route = createFileRoute("/criar")({ component: Create });

const MAX_PHOTOS = 5;

// Mock placa lookup
const MOCK_PLACAS: Record<string, { brand: string; model: string; year: number; color: string }> = {
  "ABC1234": { brand: "Chevrolet", model: "Opala", year: 1976, color: "Verde" },
  "DEF5678": { brand: "Volkswagen", model: "Fusca", year: 1973, color: "Azul" },
  "GHI9012": { brand: "Ford", model: "Maverick", year: 1974, color: "Laranja" },
};

const DOC_FISICOS_OPTIONS = [
  "CRLV original", "Manual do proprietário", "Chave reserva",
  "Nota fiscal", "DUTs anteriores", "Laudos de vistoria",
];

// Simple confetti
function showConfetti() {
  const colors = ["#C0522B", "#1a1a1a", "#f5f0e8", "#4CAF50", "#FF9800"];
  for (let i = 0; i < 60; i++) {
    const el = document.createElement("div");
    el.style.cssText = `
      position:fixed; top:-10px; left:${Math.random()*100}vw;
      width:8px; height:8px; border-radius:${Math.random()>0.5?"50%":"2px"};
      background:${colors[Math.floor(Math.random()*colors.length)]};
      animation:fall ${1+Math.random()*2}s ease-in forwards;
      z-index:9999;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
}

function Create() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const addListing = useAppStore((s) => s.addListing);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate({ to: "/login" });
  }, [user]);

  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<Category>("completo");
  const [data, setData] = useState({
    brand: "", model: "", year: "", color: "", engine: "", km: "", chassi: "",
    description: "", price: "", noPrice: false, whatsapp: "", state: "", city: "",
    placa: "",
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState("");
  const [placaStatus, setPlacaStatus] = useState<"idle"|"ok"|"divergencia">("idle");
  const [alertaPreco, setAlertaPreco] = useState(false);

  // Situação documental
  const [docNome, setDocNome] = useState("proprio");
  const [docTransferencias, setDocTransferencias] = useState("nenhuma");
  const [docIpva, setDocIpva] = useState("naoSeAplica");
  const [docIpvaAnos, setDocIpvaAnos] = useState("");
  const [docLicenciamento, setDocLicenciamento] = useState("emDia");
  const [docChassi, setDocChassi] = useState("visivelLegivel");
  const [docMotor, setDocMotor] = useState("original");
  const [docMultas, setDocMultas] = useState("nenhuma");
  const [docMultasValor, setDocMultasValor] = useState("");
  const [docAjuda, setDocAjuda] = useState("sim");
  const [docFisicos, setDocFisicos] = useState<string[]>([]);

  const update = (k: keyof typeof data, v: string | boolean) => setData((d) => ({ ...d, [k]: v }));

  // Suppress unused warning until preço-suspeito heuristic is reworked
  void alertaPreco;
  void setAlertaPreco;

  const consultarPlaca = () => {
    const placa = data.placa.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const found = MOCK_PLACAS[placa];
    if (!found) {
      toast.info("Placa não encontrada no sistema mock");
      return;
    }
    const divergencias = [];
    if (data.brand && data.brand !== found.brand) divergencias.push("marca");
    if (data.model && data.model !== found.model) divergencias.push("modelo");
    if (data.year && String(found.year) !== data.year) divergencias.push("ano");
    if (data.color && data.color !== found.color) divergencias.push("cor");

    if (divergencias.length === 0) {
      setPlacaStatus("ok");
      if (!data.brand) update("brand", found.brand);
      if (!data.model) update("model", found.model);
      if (!data.year)  update("year", String(found.year));
      if (!data.color) update("color", found.color);
      toast.success("Dados conferidos com a placa ✅");
    } else {
      setPlacaStatus("divergencia");
      toast.warning(`Divergência detectada: ${divergencias.join(", ")}`);
    }
  };

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    setUploadError("");
    const remaining = MAX_PHOTOS - photos.length;
    if (files.length > remaining) setUploadError("Limite de 5 fotos por anúncio atingido");
    const accepted = Array.from(files).slice(0, remaining);
    Promise.all(
      accepted.map((f) => new Promise<string>((res) => {
        const r = new FileReader();
        r.onload = () => res(r.result as string);
        r.readAsDataURL(f);
      }))
    ).then((urls) => setPhotos((p) => [...p, ...urls].slice(0, MAX_PHOTOS)));
  };

  const movePhoto = (i: number, dir: -1 | 1) => {
    setPhotos((p) => {
      const arr = [...p]; const j = i + dir;
      if (j < 0 || j >= arr.length) return arr;
      [arr[i], arr[j]] = [arr[j], arr[i]]; return arr;
    });
  };

  const submit = () => {
    const price = data.noPrice ? null : Number(data.price) || null;
    const newListing: Listing = {
      id: "l" + Date.now(),
      title: `${data.brand} ${data.model}`.trim() || "Sem título",
      brand: data.brand, model: data.model,
      year: Number(data.year) || 1970,
      category, engine: data.engine, color: data.color,
      km: Number(data.km) || 0,
      chassi: data.chassi || "—",
      documento: "OK", price, description: data.description, photos,
      city: data.city, state: data.state || "SP",
      sellerId: user?.id ?? "u9",
      status: "ativo",
      createdAt: new Date().toISOString().slice(0, 10),
      distancia: "a 0 km de você",
      scoreConfianca: 50,
      alertaPrecoSuspeito: false,
      fotoDuplicadaFlag: false,
      verificacaoLocalizacao: { badge: "semDados", fonteA: `${data.city}, ${data.state || "SP"}`, fonteB: null, fonteC: null },
      situacaoDocumental: {
        documentoNome: docNome as any, transferenciasAcumuladas: docTransferencias as any,
        ipva: docIpva as any, ipvaAnosAtraso: docIpvaAnos ? Number(docIpvaAnos) : null,
        licenciamento: docLicenciamento as any, chassi: docChassi as any, motor: docMotor as any,
        multas: docMultas as any, multasValor: docMultasValor ? Number(docMultasValor) : null,
        aceitaAjudarRegularizacao: docAjuda as any, documentosFisicos: docFisicos,
      },
    };

    addListing(newListing);

    // Add confetti CSS if not present
    if (!document.getElementById("confetti-style")) {
      const s = document.createElement("style");
      s.id = "confetti-style";
      s.textContent = "@keyframes fall{to{transform:translateY(110vh) rotate(720deg);opacity:0}}";
      document.head.appendChild(s);
    }
    showConfetti();
    toast.success("🎉 Anúncio publicado com sucesso!");
    setTimeout(() => navigate({ to: "/car/$id", params: { id: newListing.id } }), 1200);
  };

  const docRadio = (label: string, name: string, value: string, onChange: (v: string) => void, opts: [string, string][]) => (
    <div>
      <Label className="mb-2 block text-sm font-medium">{label}</Label>
      <RadioGroup value={value} onValueChange={onChange} className="grid grid-cols-2 gap-2">
        {opts.map(([v, l]) => (
          <div key={v} className={cn("flex items-center gap-2 rounded-[8px] border p-2.5 cursor-pointer transition-colors",
            value === v ? "border-[color:var(--color-terracotta)] bg-[color:var(--color-terracotta)]/5" : "border-border hover:border-foreground/30")}>
            <RadioGroupItem value={v} id={`${name}_${v}`} />
            <Label htmlFor={`${name}_${v}`} className="text-xs cursor-pointer">{l}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Header />
      <main id="main-content" className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-serif text-3xl">Criar anúncio</h1>

        {/* Steps */}
        <div className="mt-4 flex items-center gap-2 text-sm">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <span className={cn("flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold",
                step >= s ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground")}>
                {step > s ? <Check className="h-3.5 w-3.5" /> : s}
              </span>
              {s < 3 && <div className={cn("h-px w-10", step > s ? "bg-foreground" : "bg-border")} />}
            </div>
          ))}
          <span className="ml-3 text-xs uppercase tracking-wide text-muted-foreground">
            {step === 1 ? "Dados do veículo" : step === 2 ? "Fotos e descrição" : "Preço e contato"}
          </span>
        </div>

        <div className="mt-8 rounded-[10px] border border-border bg-card p-6">

          {/* ───── STEP 1 ───── */}
          {step === 1 && (
            <div className="space-y-8">
              {/* Condição */}
              <div>
                <Label className="mb-3 block">Condição</Label>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {(["completo", "fazer", "pecas"] as Category[]).map((c) => {
                    const Icon = c === "completo" ? Check : c === "fazer" ? Wrench : Cog;
                    return (
                      <button key={c} onClick={() => setCategory(c)}
                        className={cn("flex flex-col items-start gap-2 rounded-[10px] border p-4 text-left transition-all",
                          category === c ? "border-foreground bg-secondary" : "border-border hover:border-foreground/30")}>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full text-white" style={{ backgroundColor: CATEGORY_COLORS[c] }}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="font-serif text-base">{CATEGORY_LABELS[c]}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Placa */}
              <div>
                <Label className="mb-1.5 block">Consultar placa (opcional)</Label>
                <div className="flex gap-2">
                  <Input placeholder="ABC1234" value={data.placa} onChange={(e) => update("placa", e.target.value.toUpperCase())}
                    className={cn("max-w-[180px]", placaStatus === "ok" && "border-green-500", placaStatus === "divergencia" && "border-red-400")} />
                  <Button type="button" variant="outline" onClick={consultarPlaca}>
                    <Search className="h-4 w-4 mr-1" /> Consultar
                  </Button>
                </div>
                {placaStatus === "ok" && <p className="mt-1 text-xs text-green-600">✅ Dados conferidos com a placa</p>}
                {placaStatus === "divergencia" && <p className="mt-1 text-xs text-red-500">⚠️ Divergência detectada — verifique os campos</p>}
              </div>

              {/* Dados básicos */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  ["Marca", "brand"], ["Modelo", "model"], ["Ano", "year"], ["Cor", "color"],
                  ["Motor", "engine"], ["Quilometragem", "km"], ["Número do chassi", "chassi"],
                ].map(([l, k]) => (
                  <div key={k}>
                    <Label className="mb-1.5 block">{l}</Label>
                    <Input value={data[k as keyof typeof data] as string}
                      onChange={(e) => update(k as keyof typeof data, e.target.value)} />
                  </div>
                ))}
              </div>

              {/* SITUAÇÃO DOCUMENTAL */}
              <div className="rounded-[10px] border-2 border-amber-300 bg-amber-50/50 p-5 space-y-5">
                <div>
                  <h3 className="font-serif text-lg text-amber-900">Situação Documental</h3>
                  <p className="text-xs text-amber-700 mt-1">Preencha com honestidade. Isso aumenta a confiança dos compradores.</p>
                </div>

                {docRadio("Documento em nome de", "docNome", docNome, setDocNome, [
                  ["proprio","Próprio nome"],["terceiro","Terceiro"],["falecido","Proprietário falecido"],["empresaExtinta","Empresa extinta"],["desconhecido","Desconhecido"],
                ])}
                {docRadio("Transferências acumuladas", "docTrans", docTransferencias, setDocTransferencias, [
                  ["nenhuma","Nenhuma"],["1a2","1 a 2"],["3oumais","3 ou mais"],["naosei","Não sei"],
                ])}
                <div className="space-y-2">
                  {docRadio("IPVA", "docIpva", docIpva, setDocIpva, [
                    ["emDia","Em dia"],["isentoAntiguidade","Isento (antiguidade)"],["atrasado","Atrasado"],["naoSeAplica","Não se aplica"],
                  ])}
                  {docIpva === "atrasado" && (
                    <div>
                      <Label className="mb-1 block text-xs">Anos de atraso</Label>
                      <Input type="number" min={1} max={30} value={docIpvaAnos} onChange={(e) => setDocIpvaAnos(e.target.value)} className="w-28" />
                    </div>
                  )}
                </div>
                {docRadio("Licenciamento", "docLic", docLicenciamento, setDocLicenciamento, [
                  ["emDia","Em dia"],["atrasado","Atrasado"],["nuncaLicenciadoEstado","Nunca licenciado no estado"],["sucata","Baixado como sucata"],["semPlaca","Sem placa"],
                ])}
                {docRadio("Chassi", "docChassi", docChassi, setDocChassi, [
                  ["visivelLegivel","Visível e legível"],["parcialmenteLegivel","Parcialmente legível"],["ilegivel","Ilegível"],["recarimbado","Recarimbado"],["naoLocalizado","Não localizado"],
                ])}
                {docRadio("Motor", "docMotor", docMotor, setDocMotor, [
                  ["original","Original"],["trocadoMesmaFamilia","Trocado (mesma família)"],["trocadoDiferente","Trocado (diferente)"],["semNumero","Sem número"],
                ])}
                <div className="space-y-2">
                  {docRadio("Multas", "docMultas", docMultas, setDocMultas, [
                    ["nenhuma","Nenhuma"],["comMultas","Com multas"],["naoVerificado","Não verificado"],
                  ])}
                  {docMultas === "comMultas" && (
                    <div>
                      <Label className="mb-1 block text-xs">Valor estimado das multas (R$)</Label>
                      <Input type="number" value={docMultasValor} onChange={(e) => setDocMultasValor(e.target.value)} className="w-40" />
                    </div>
                  )}
                </div>
                {docRadio("Aceita ajudar na regularização", "docAjuda", docAjuda, setDocAjuda, [
                  ["sim","Sim"],["parcialmente","Parcialmente"],["nao","Não"],
                ])}
                <div>
                  <Label className="mb-2 block text-sm font-medium">Documentos físicos disponíveis</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {DOC_FISICOS_OPTIONS.map((opt) => (
                      <label key={opt} className="flex items-center gap-2 text-xs cursor-pointer">
                        <Checkbox
                          checked={docFisicos.includes(opt)}
                          onCheckedChange={(v) => setDocFisicos((prev) =>
                            v ? [...prev, opt] : prev.filter((x) => x !== opt)
                          )}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              </div>


            </div>
          )}

          {/* ───── STEP 2 ───── */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Dicas contextuais */}
              <div className="rounded-[8px] bg-secondary border border-border p-4 text-sm space-y-1">
                <p className="font-medium">📸 Dicas para fotos ({CATEGORY_LABELS[category]})</p>
                {category === "completo" && <p className="text-xs text-muted-foreground">Fotografe: chassi, motor, plaqueta, documentos, 4 laterais, interior</p>}
                {category === "fazer" && <p className="text-xs text-muted-foreground">Mostre ferrugem, partes faltantes, motor, documentos disponíveis</p>}
                {category === "pecas" && <p className="text-xs text-muted-foreground">Fotografe cada peça individualmente com boa iluminação</p>}
              </div>

              {/* Upload */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label>Fotos ({photos.length}/{MAX_PHOTOS})</Label>
                </div>
                <label className={cn("flex flex-col items-center justify-center gap-2 rounded-[10px] border-2 border-dashed p-8 transition-colors",
                  photos.length >= MAX_PHOTOS ? "cursor-not-allowed bg-muted/50 opacity-60" : "cursor-pointer border-border hover:border-foreground/40")}>
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  {photos.length >= MAX_PHOTOS ? (
                    <span className="text-sm text-muted-foreground">Limite de 5 fotos atingido</span>
                  ) : (
                    <>
                      <span className="text-sm">Arraste ou clique para enviar (até {MAX_PHOTOS - photos.length} mais)</span>
                      <input type="file" multiple accept="image/*" className="sr-only"
                        disabled={photos.length >= MAX_PHOTOS}
                        onChange={(e) => onFiles(e.target.files)} />
                    </>
                  )}
                </label>
                {uploadError && <p className="mt-2 text-xs text-destructive">{uploadError}</p>}

                {/* LGPD notice */}
                <p className="mt-2 text-xs text-muted-foreground">
                  📍 As fotos podem conter dados de localização (EXIF) utilizados para verificar a autenticidade do anúncio.
                </p>

                {photos.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-5">
                    {photos.map((p, i) => (
                      <div key={i} className="group relative aspect-square overflow-hidden rounded-[10px] border border-border bg-secondary">
                        {p.startsWith("data:") ? (
                          <img src={p} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center"><ImageIcon className="h-6 w-6 text-muted-foreground" /></div>
                        )}
                        <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <div className="flex gap-1">
                            <button onClick={() => movePhoto(i, -1)} className="rounded bg-white/90 px-1.5 text-xs">←</button>
                            <button onClick={() => movePhoto(i, 1)} className="rounded bg-white/90 px-1.5 text-xs">→</button>
                          </div>
                          <button onClick={() => setPhotos((arr) => arr.filter((_, k) => k !== i))} className="rounded bg-white/90 p-1 text-destructive">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        {i === 0 && <span className="absolute top-1 left-1 rounded bg-black/70 px-1 text-[9px] text-white">Capa</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label className="mb-1.5 block">Descrição</Label>
                <Textarea rows={6} value={data.description} onChange={(e) => update("description", e.target.value)}
                  placeholder="Conte a história do carro, estado de conservação, peças trocadas…" />
              </div>
            </div>
          )}

          {/* ───── STEP 3 ───── */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Preço */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label>Preço</Label>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                    <Switch checked={data.noPrice} onCheckedChange={(v) => update("noPrice", v)} />
                    Não informar preço
                  </label>
                </div>
                <Input type="number" disabled={data.noPrice} value={data.price}
                  onChange={(e) => update("price", e.target.value)} placeholder="R$ 0" />
                <p className="mt-2 text-xs text-muted-foreground">
                  Clássicos são peças únicas — defina o preço com base no estado, raridade e originalidade do veículo.
                </p>
              </div>

              {/* Visibilidade */}
              <div>
                <Label className="mb-2 block">Raio de visibilidade</Label>
                <div className="flex flex-wrap gap-2">
                  {["25km","50km","100km","Todo Brasil"].map((r) => (
                    <button key={r} className="rounded-full border border-border px-3 py-1.5 text-xs hover:border-foreground/40 hover:bg-secondary transition-colors">
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-1.5 block">WhatsApp</Label>
                <Input value={data.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} placeholder="(11) 99999-9999" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1.5 block">Estado</Label>
                  <Select value={data.state} onValueChange={(v) => update("state", v)}>
                    <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                    <SelectContent>{BR_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5 block">Cidade</Label>
                  <Input value={data.city} onChange={(e) => update("city", e.target.value)} />
                </div>
              </div>



              {/* Plano */}
              <div>
                <Label className="mb-2 block">Plano de publicação</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id:"free", name:"Gratuito", desc:"Até 3 anúncios", price:"R$ 0" },
                    { id:"premium", name:"Premium", desc:"Até 20 anúncios + destaque", price:"R$ 49,90/mês" },
                  ].map((p) => (
                    <div key={p.id} className={cn("rounded-[10px] border p-4 cursor-pointer transition-colors",
                      p.id === "free" ? "border-foreground bg-secondary" : "border-[color:var(--color-terracotta)] bg-[color:var(--color-terracotta)]/5")}>
                      <p className="font-serif text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.desc}</p>
                      <p className="mt-1 text-xs font-semibold">{p.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
            <Button variant="ghost" onClick={() => step === 1 ? navigate({ to: "/" }) : setStep(step - 1)}>
              {step === 1 ? <><X className="h-4 w-4" /> Cancelar</> : "Voltar"}
            </Button>
            {step < 3 ? (
              <Button onClick={() => setStep(step + 1)} className="bg-foreground text-background hover:bg-foreground/90">Continuar</Button>
            ) : (
              <Button onClick={submit} className="bg-[color:var(--color-terracotta)] text-white hover:bg-[color:var(--color-terracotta-dark)]">
                🚀 Publicar anúncio
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

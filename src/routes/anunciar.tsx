import { useState, useRef, useMemo } from "react";
import { useFormDraft } from "@/hooks/use-form-draft";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Car, Wrench, Package, Upload, X, CheckCircle, ChevronRight, Gem, ShieldCheck, Star, Save, RotateCcw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { BRANDS } from "@/lib/mock-data";
import { useAppStore } from "@/store/app-store";
import type { Category, Listing, EstadoConservacao, Originalidade, Raridade } from "@/lib/types";
import { ESTADO_LABELS, ORIGINALIDADE_LABELS, RARIDADE_LABELS } from "@/lib/types";

export const Route = createFileRoute("/anunciar")({ component: Anunciar });

// ─── Constantes ───────────────────────────────────────────────────────────────

const MODELS_BY_BRAND: Record<string, string[]> = {
  Chevrolet: [
    "Opala", "Opala 2.5", "Opala Comodoro", "Opala Diplomata", "Opala SS",
    "Caravan", "Caravan Comodoro", "Veraneio", "Veraneio C10", "C10", "C14", "D10", "D20",
    "Chevette", "Chevette SL", "Chevette Hatch", "Marajó", "Chevy 500",
    "Monza", "Monza Classic", "Monza SL/E", "Kadett", "Kadett GSi",
    "Bel Air", "Impala", "Camaro SS",
  ],
  Volkswagen: [
    "Fusca", "Fusca 1300", "Fusca 1500", "Fusca 1600", "Itamar",
    "Brasília", "Variant", "Variant II", "TL", "SP2",
    "Kombi Standard", "Kombi Luxo", "Kombi Pick-up",
    "Passat", "Passat TS", "Gol", "Gol GT", "Gol GTI", "Voyage", "Parati", "Saveiro",
    "Karmann Ghia", "Karmann Ghia TC", "Santana", "Apollo", "Quantum",
  ],
  Ford: [
    "Galaxie", "Galaxie 500", "Galaxie LTD", "Landau",
    "Maverick", "Maverick GT", "Maverick 2.3", "Maverick Super",
    "Corcel", "Corcel II", "Corcel II GT", "Belina", "Belina II", "Del Rey", "Del Rey Ghia",
    "Escort", "Escort XR3", "Escort Hobby", "Verona", "Pampa",
    "F-100", "F-1000", "F-75", "Rural", "Mustang",
  ],
  Fiat: [
    "Fiat 147", "Fiat 147 Rallye", "Panorama", "Spazio", "Oggi",
    "Uno", "Uno Mille", "Uno Turbo", "Premio", "Elba",
    "Tempra", "Tipo", "Palio", "Strada",
  ],
  Dodge: [
    "Charger", "Charger R/T", "Charger RT", "Charger 318", "Charger 383",
    "Dart", "Dart De Luxo", "Dart GT", "Dart Gran Sedan", "Magnum", "LeBaron", "Polara",
  ],
  Willys: [
    "Rural Willys", "Rural 4x4", "Jeep CJ-5", "Jeep CJ-6", "Aero Willys",
    "Itamaraty", "Itamaraty Executivo", "Interlagos", "Gordini",
  ],
  Puma: ["Puma GT", "Puma GTE", "Puma GTI", "Puma GTB", "Puma AM"],
  Renault: [
    "Renault Gordini", "Renault Dauphine", "Renault 4", "Renault 12",
    "Renault 5", "Alpine", "Clio", "Twingo",
  ],
  Simca: ["Simca Chambord", "Simca Présidence", "Simca Esplanada", "Simca Tufão", "Simca Rallye"],
  GM: ["Veraneio C10", "C14", "C15"],
  Toyota: ["Bandeirante", "Bandeirante Curto", "Bandeirante Longo", "Corolla"],
  Mercedes: ["180", "190", "220", "280 SL", "L-1113", "LP-321"],
  BMW: ["2002", "2002 Tii", "Série 3 E21", "Série 3 E30"],
  Alfa: ["Alfa Romeo 2300", "Alfa Romeo JK", "Alfa Romeo Giulia", "Spider Duetto"],
  Lada: ["Niva", "Laika", "Samara"],
};

const MODEL_NAO_LISTADO = "__nao_listado__";

const COMBUSTIVEIS = ["Gasolina", "Álcool", "Flex", "Diesel", "GNV"];
const CAMBIOS = ["Manual", "Automático", "Semi-automático"];
const CARROCERIAS = ["Sedã", "Cupê", "Perua/SW", "Conversível", "Furgão/Van", "Caminhonete", "SUV"];
const CORES = ["Branco", "Preto", "Prata", "Cinza", "Vermelho", "Azul", "Verde", "Amarelo", "Laranja", "Marrom", "Bege", "Outro"];
const PLACAS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const RAIOS = ["25km", "50km", "100km", "Todo Brasil"];

const ANOS = Array.from({ length: 2024 - 1950 + 1 }, (_, i) => String(2024 - i));

const CATEGORY_INFO = {
  completo: {
    icon: Car,
    label: "Carro completo",
    desc: "Veículo em condições de uso, documentado e funcionando",
    tips: ["Destaque o histórico de manutenção", "Mencione todos os acessórios originais", "Informe se é único dono", "Faça fotos do interior, motor e documentos"],
  },
  fazer: {
    icon: Wrench,
    label: "Para fazer",
    desc: "Veículo que precisa de restauração ou reparos significativos",
    tips: ["Seja honesto sobre o que precisa de reparo", "Liste o que já foi feito", "Mostre a carroceria por todos os ângulos", "Informe o estado do chassi"],
  },
  pecas: {
    icon: Package,
    label: "Para peças",
    desc: "Veículo desmontado ou destinado à retirada de peças",
    tips: ["Liste as peças aproveitáveis disponíveis", "Informe o estado de cada peça principal", "Inclua fotos das peças em bom estado", "Mencione a situação documental"],
  },
} as const;

// Situação documental defaults
const DOC_DEFAULTS = {
  documentoNome: "proprio" as const,
  transferenciasAcumuladas: "nenhuma" as const,
  ipva: "isentoAntiguidade" as const,
  ipvaAnosAtraso: null,
  licenciamento: "emDia" as const,
  chassi: "visivelLegivel" as const,
  motor: "original" as const,
  multas: "nenhuma" as const,
  multasValor: null,
  aceitaAjudarRegularizacao: "sim" as const,
  documentosFisicos: [] as string[],
};

// ─── Tipos internos ───────────────────────────────────────────────────────────

type Step = 1 | 2 | 3;

interface FormData {
  category: Category | null;
  brand: string;
  model: string;
  modelCustom: string;
  anoFab: string;
  anoMod: string;
  motor: string;
  combustivel: string;
  cambio: string;
  cor: string;
  km: string;
  carroceria: string;
  finalPlaca: string;
  unicoDono: boolean;
  ipvaPago: boolean;
  comManual: boolean;
  chaveReserva: boolean;
  aceitaTroca: boolean;
  docNome: string;
  docTransferencias: string;
  docIpva: string;
  docLicenciamento: string;
  docChassi: string;
  docMotor: string;
  docMultas: string;
  docAjuda: string;
  description: string;
  photos: string[];
  price: string;
  semPreco: boolean;
  estadoConservacao: EstadoConservacao | "";
  originalidade: Originalidade | "";
  raridade: Raridade | "";
  justificativaPreco: string;
  cep: string;
  cidade: string;
  estado: string;
  raio: string;
  whatsapp: string;
  exibirWhatsapp: boolean;
  plano: "gratuito" | "premium";
}

const defaultForm: FormData = {
  category: null,
  brand: "", model: "", modelCustom: "", anoFab: "", anoMod: "",
  motor: "", combustivel: "", cambio: "", cor: "", km: "",
  carroceria: "", finalPlaca: "",
  unicoDono: false, ipvaPago: false, comManual: false,
  chaveReserva: false, aceitaTroca: false,
  docNome: "proprio", docTransferencias: "nenhuma", docIpva: "isentoAntiguidade",
  docLicenciamento: "emDia", docChassi: "visivelLegivel", docMotor: "original",
  docMultas: "nenhuma", docAjuda: "sim",
  description: "",
  photos: [],
  price: "", semPreco: false,
  estadoConservacao: "", originalidade: "", raridade: "", justificativaPreco: "",
  cep: "", cidade: "", estado: "", raio: "Todo Brasil",
  whatsapp: "", exibirWhatsapp: true,
  plano: "gratuito",
};

const testForm: FormData = {
  category: "completo",
  brand: "Chevrolet", model: "Opala", modelCustom: "", anoFab: "1979", anoMod: "1979",
  motor: "4.1 6cc", combustivel: "Gasolina", cambio: "Manual", cor: "Preto", km: "85000",
  carroceria: "Sedã", finalPlaca: "7",
  unicoDono: true, ipvaPago: true, comManual: true,
  chaveReserva: true, aceitaTroca: false,
  docNome: "proprio", docTransferencias: "nenhuma", docIpva: "isentoAntiguidade",
  docLicenciamento: "emDia", docChassi: "visivelLegivel", docMotor: "original",
  docMultas: "nenhuma", docAjuda: "sim",
  description:
    "Opala Comodoro 1979 em excelente estado, motor 4.1 6cc original, lataria preservada, " +
    "interior reformado mantendo características originais. Documentação 100% em dia, único dono " +
    "nos últimos 12 anos. Manual e chave reserva inclusos. Aceito proposta para venda à vista.",
  photos: [
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80",
    "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80",
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80",
  ],
  price: "8500000", semPreco: false,
  estadoConservacao: "bomEstadoUso",
  originalidade: "totalmenteOriginal",
  raridade: "raro",
  justificativaPreco:
    "Preço alinhado à tabela FIPE de colecionáveis. Opala 1979 Comodoro com motor original e documentação completa é raridade no mercado, valoriza ano a ano.",
  cep: "01310-100", cidade: "São Paulo", estado: "SP", raio: "Todo Brasil",
  whatsapp: "(11) 98765-4321", exibirWhatsapp: true,
  plano: "gratuito",
};

// ─── Helpers UI ───────────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: Step }) {
  return (
    <div className="sticky top-16 z-30 bg-background border-b border-border">
      <div className="mx-auto max-w-5xl px-6 py-3">
        <div className="flex items-center gap-2">
          {([1, 2, 3] as Step[]).map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <div className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                step === s
                  ? "bg-[color:var(--color-terracotta)] text-white"
                  : step > s
                  ? "bg-[color:var(--color-cat-complete)] text-white"
                  : "bg-muted text-muted-foreground",
              )}>
                {step > s ? <CheckCircle className="h-4 w-4" /> : s}
              </div>
              <span className={cn(
                "hidden text-xs sm:block",
                step === s ? "font-semibold text-foreground" : "text-muted-foreground",
              )}>
                {s === 1 ? "Dados do veículo" : s === 2 ? "Fotos & Descrição" : "Preço & Contato"}
              </span>
              {i < 2 && <div className={cn("h-px flex-1", step > s ? "bg-[color:var(--color-cat-complete)]" : "bg-border")} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 font-serif text-lg font-medium">{children}</h3>;
}

function FieldGroup({
  label, children, required, error,
}: { label: string; children: React.ReactNode; required?: boolean; error?: string | null }) {
  return (
    <div>
      <Label className="mb-1 block text-sm font-medium">
        {label}{required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error && (
        <p role="alert" className="mt-1 flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

function RadioGroup({
  name, options, value, onChange,
}: {
  name: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <label
          key={o.value}
          className={cn(
            "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
            value === o.value
              ? "border-[color:var(--color-terracotta)] bg-[color:var(--color-terracotta)]/10 font-medium text-[color:var(--color-terracotta)]"
              : "border-border hover:border-muted-foreground",
          )}
        >
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
            className="sr-only"
          />
          {o.label}
        </label>
      ))}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

function Anunciar() {
  const navigate = useNavigate();
  const addListing = useAppStore((s) => s.addListing);
  const currentUser = useAppStore((s) => s.users.find((u) => u.id === s.currentUserId));

  const [step, setStep] = useState<Step>(1);
  const { value: form, setValue: setForm, hasDraft, clearDraft } = useFormDraft<FormData>(
    "anunciar-form",
    defaultForm,
  );
  const [draftBannerVisible, setDraftBannerVisible] = useState(true);
  const [published, setPublished] = useState(false);
  const [newListingId, setNewListingId] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const markTouched = (field: string) => setTouched((p) => (p[field] ? p : { ...p, [field]: true }));
  const markStepTouched = (fields: string[]) =>
    setTouched((p) => fields.reduce((acc, f) => ({ ...acc, [f]: true }), { ...p }));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const upd = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const priceNum = parseFloat(form.price.replace(/\D/g, "")) / 100 || 0;

  const availableModels = form.brand ? (MODELS_BY_BRAND[form.brand] ?? []) : [];

  // ─── Erros inline (derivados) ───────────────────────────────────────────────
  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!form.category) e.category = "Selecione a condição do veículo";
    if (!form.brand) e.brand = "Selecione a marca";
    if (!form.model) e.model = "Selecione o modelo";
    if (form.model === MODEL_NAO_LISTADO && !form.modelCustom.trim())
      e.modelCustom = "Escreva o nome do modelo";
    if (!form.anoFab) e.anoFab = "Informe o ano de fabricação";
    if (form.km && (isNaN(Number(form.km)) || Number(form.km) < 0))
      e.km = "Quilometragem inválida";

    if (form.photos.length === 0) e.photos = "Adicione pelo menos 1 foto";
    if (!form.description.trim()) e.description = "Adicione uma descrição";
    else if (form.description.trim().length < 20)
      e.description = "Descrição muito curta (mínimo 20 caracteres)";

    if (!form.semPreco && !form.price) e.price = "Informe o preço ou marque 'Não informar'";
    if (!form.estadoConservacao) e.estadoConservacao = "Indique o estado de conservação";
    if (!form.originalidade) e.originalidade = "Indique o nível de originalidade";
    if (!form.cidade.trim()) e.cidade = "Informe a cidade";
    if (form.cep && !/^\d{5}-?\d{3}$/.test(form.cep)) e.cep = "CEP inválido (use 00000-000)";
    if (form.whatsapp && !/^\(?\d{2}\)?\s*\d{4,5}-?\d{4}$/.test(form.whatsapp))
      e.whatsapp = "WhatsApp inválido";
    return e;
  }, [form]);

  const STEP_FIELDS: Record<Step, string[]> = {
    1: ["category", "brand", "model", "modelCustom", "anoFab", "km"],
    2: ["photos", "description"],
    3: ["price", "estadoConservacao", "originalidade", "cidade", "cep", "whatsapp"],
  };

  const stepHasErrors = (s: Step) => STEP_FIELDS[s].some((f) => errors[f]);
  const err = (field: string) => (touched[field] ? errors[field] ?? null : null);

  // ─── CEP Lookup (mock) ──────────────────────────────────────────────────────
  const lookupCep = (cep: string) => {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) return;
    // Mock: use first 2 digits to guess state
    const map: Record<string, { cidade: string; estado: string }> = {
      "01": { cidade: "São Paulo", estado: "SP" },
      "20": { cidade: "Rio de Janeiro", estado: "RJ" },
      "30": { cidade: "Belo Horizonte", estado: "MG" },
      "80": { cidade: "Curitiba", estado: "PR" },
      "90": { cidade: "Porto Alegre", estado: "RS" },
      "40": { cidade: "Salvador", estado: "BA" },
      "60": { cidade: "Fortaleza", estado: "CE" },
      "74": { cidade: "Goiânia", estado: "GO" },
    };
    const prefix = clean.slice(0, 2);
    const found = map[prefix] ?? { cidade: "São Paulo", estado: "SP" };
    upd("cidade", found.cidade);
    upd("estado", found.estado);
  };

  // ─── Upload fotos ───────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (form.photos.length >= 5) return;
    const slots = 5 - form.photos.length;
    const toAdd = files.slice(0, slots).map((f) => URL.createObjectURL(f));
    upd("photos", [...form.photos, ...toAdd]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (idx: number) => {
    upd("photos", form.photos.filter((_, i) => i !== idx));
  };

  // ─── Validações por step (usam errors derivados) ────────────────────────────
  const validateStepInline = (s: Step) => {
    markStepTouched(STEP_FIELDS[s]);
    if (stepHasErrors(s)) {
      toast.error("Corrija os campos destacados antes de continuar");
      return false;
    }
    return true;
  };

  // ─── Publicar ───────────────────────────────────────────────────────────────
  const handlePublish = () => {
    if (!validateStepInline(3)) return;

    const id = "l_" + Date.now();
    const modeloFinal = form.model === MODEL_NAO_LISTADO ? form.modelCustom.trim() : form.model;
    const listing: Listing = {
      id,
      title: `${form.brand} ${modeloFinal} ${form.anoFab}`,
      brand: form.brand,
      model: modeloFinal,
      year: parseInt(form.anoFab) || 2000,
      category: form.category ?? "completo",
      engine: form.motor || "—",
      color: form.cor || "—",
      km: parseInt(form.km) || 0,
      chassi: "—",
      documento: "OK",
      price: form.semPreco ? null : priceNum || null,
      description: form.description,
      photos: form.photos.length > 0
        ? form.photos
        : ["https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80"],
      city: form.cidade,
      state: form.estado,
      sellerId: currentUser?.id ?? "u1",
      status: "ativo",
      createdAt: new Date().toISOString().slice(0, 10),
      distancia: "—",
      scoreConfianca: 75,
      alertaPrecoSuspeito: false,
      precificacao: {
        valor: form.semPreco ? null : priceNum || null,
        estadoConservacao: form.estadoConservacao as EstadoConservacao,
        originalidade: form.originalidade as Originalidade,
        raridade: form.raridade as Raridade,
        justificativa: form.justificativaPreco.trim(),
      },
      fotoDuplicadaFlag: false,
      verificacaoLocalizacao: {
        badge: "semDados",
        fonteA: `${form.cidade}, ${form.estado}`,
        fonteB: null,
        fonteC: null,
      },
      situacaoDocumental: DOC_DEFAULTS,
      destaquePremium: form.plano === "premium",
    };

    addListing(listing);
    setNewListingId(id);
    setPublished(true);
    // Successful publish → wipe the local draft
    clearDraft();
  };

  // ─── Success state ──────────────────────────────────────────────────────────
  if (published) {
    return (
      <>
        <Header />
        <div className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
          {/* CSS confetti */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: 40 }).map((_, i) => (
              <span
                key={i}
                className="absolute block h-3 w-2 animate-bounce rounded-sm opacity-80"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 60}%`,
                  backgroundColor: ["var(--color-terracotta-soft)", "var(--color-cat-complete)", "var(--color-gold)", "var(--color-cat-todo)", "var(--color-terracotta-deep)"][i % 5],
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${0.8 + Math.random() * 1.2}s`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 max-w-md">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[color:var(--color-cat-complete)]/10">
              <CheckCircle className="h-10 w-10 text-[color:var(--color-cat-complete)]" />
            </div>
            <h1 className="font-serif text-4xl">Anúncio publicado!</h1>
            <p className="mt-4 text-muted-foreground">
              Seu anúncio de <strong>{form.brand} {form.model} {form.anoFab}</strong> foi publicado com sucesso e já está visível para compradores.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button asChild className="bg-[color:var(--color-terracotta)] text-white hover:bg-[color:var(--color-terracotta-dark)]">
                <Link to="/car/$id" params={{ id: newListingId }}>Ver meu anúncio</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/anuncios">Ver todos os anúncios</Link>
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // ─── Render steps ───────────────────────────────────────────────────────────
  return (
    <>
      <Header />
      <ProgressBar step={step} />

      {hasDraft && draftBannerVisible && (
        <div
          role="status"
          className="mx-auto mt-4 flex max-w-5xl items-center justify-between gap-3 rounded-md border border-[color:var(--color-terracotta)]/30 bg-[color:var(--color-terracotta)]/5 px-4 py-3 text-sm"
        >
          <div className="flex items-center gap-2 text-foreground">
            <Save className="h-4 w-4 text-[color:var(--color-terracotta)]" aria-hidden="true" />
            <span>Rascunho restaurado automaticamente.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setForm(defaultForm);
                clearDraft();
                setDraftBannerVisible(false);
              }}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium hover:bg-secondary transition-colors"
            >
              <RotateCcw className="h-3 w-3" /> Descartar rascunho
            </button>
            <button
              type="button"
              onClick={() => setDraftBannerVisible(false)}
              aria-label="Fechar aviso"
              className="rounded-md p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <main id="main-content" className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl">Anunciar veículo</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Preencha os dados do veículo para criar seu anúncio
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setForm(testForm);
              setStep(1);
              toast.success("Formulário preenchido com dados de teste");
            }}
          >
            Preencher com dados de teste
          </Button>
        </div>

        {/* ═══════════ STEP 1 ═══════════ */}
        {step === 1 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">

              {/* Condição */}
              <section className="rounded-[10px] border border-border bg-card p-6">
                <SectionTitle>Condição do veículo</SectionTitle>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {(Object.keys(CATEGORY_INFO) as Category[]).map((cat) => {
                    const info = CATEGORY_INFO[cat];
                    const Icon = info.icon;
                    const active = form.category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => upd("category", cat)}
                        className={cn(
                          "flex flex-col items-center gap-3 rounded-[8px] border p-5 text-center transition-all",
                          active
                            ? "border-[color:var(--color-terracotta)] bg-[color:var(--color-terracotta)]/8 ring-1 ring-[color:var(--color-terracotta)]"
                            : "border-border hover:border-muted-foreground",
                        )}
                      >
                        <div className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-full",
                          active ? "bg-[color:var(--color-terracotta)]/15" : "bg-muted",
                        )}>
                          <Icon className={cn("h-6 w-6", active ? "text-[color:var(--color-terracotta)]" : "text-muted-foreground")} />
                        </div>
                        <div>
                          <p className={cn("font-semibold text-sm", active && "text-[color:var(--color-terracotta)]")}>{info.label}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{info.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Dados do veículo */}
              <section className="rounded-[10px] border border-border bg-card p-6">
                <SectionTitle>Dados do veículo</SectionTitle>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FieldGroup label="Marca" required>
                    <Select value={form.brand} onValueChange={(v) => { upd("brand", v); upd("model", ""); }}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        {BRANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FieldGroup>

                  <FieldGroup label="Modelo" required>
                    <Select
                      value={form.model}
                      onValueChange={(v) => { upd("model", v); if (v !== MODEL_NAO_LISTADO) upd("modelCustom", ""); }}
                      disabled={!form.brand}
                    >
                      <SelectTrigger><SelectValue placeholder={form.brand ? "Selecione..." : "Selecione a marca primeiro"} /></SelectTrigger>
                      <SelectContent>
                        {availableModels.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        <SelectItem value={MODEL_NAO_LISTADO}>Não listado — escrever manualmente</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.model === MODEL_NAO_LISTADO && (
                      <Input
                        className="mt-2"
                        placeholder="Digite o nome exato do modelo"
                        value={form.modelCustom}
                        onChange={(e) => upd("modelCustom", e.target.value)}
                      />
                    )}
                  </FieldGroup>

                  <FieldGroup label="Ano de fabricação" required>
                    <Select value={form.anoFab} onValueChange={(v) => upd("anoFab", v)}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        {ANOS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FieldGroup>

                  <FieldGroup label="Ano do modelo">
                    <Select value={form.anoMod} onValueChange={(v) => upd("anoMod", v)}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        {ANOS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FieldGroup>

                  <FieldGroup label="Motor">
                    <Input
                      placeholder="Ex: 2.5 8v"
                      value={form.motor}
                      onChange={(e) => upd("motor", e.target.value)}
                    />
                  </FieldGroup>

                  <FieldGroup label="Combustível">
                    <Select value={form.combustivel} onValueChange={(v) => upd("combustivel", v)}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        {COMBUSTIVEIS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FieldGroup>

                  <FieldGroup label="Câmbio">
                    <Select value={form.cambio} onValueChange={(v) => upd("cambio", v)}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        {CAMBIOS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FieldGroup>

                  <FieldGroup label="Cor">
                    <Select value={form.cor} onValueChange={(v) => upd("cor", v)}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        {CORES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FieldGroup>

                  <FieldGroup label="Quilometragem">
                    <Input
                      type="number"
                      placeholder="Ex: 87000"
                      value={form.km}
                      onChange={(e) => upd("km", e.target.value)}
                    />
                  </FieldGroup>

                  <FieldGroup label="Carroceria">
                    <Select value={form.carroceria} onValueChange={(v) => upd("carroceria", v)}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        {CARROCERIAS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FieldGroup>

                  <FieldGroup label="Final de placa">
                    <Select value={form.finalPlaca} onValueChange={(v) => upd("finalPlaca", v)}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        {PLACAS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FieldGroup>
                </div>

              </section>

              {/* Checkboxes opcionais */}
              <section className="rounded-[10px] border border-border bg-card p-6">
                <SectionTitle>Informações adicionais</SectionTitle>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {([
                    { key: "unicoDono" as const, label: "Único dono" },
                    { key: "ipvaPago" as const, label: "IPVA pago" },
                    { key: "comManual" as const, label: "Com manual" },
                    { key: "chaveReserva" as const, label: "Chave reserva" },
                    { key: "aceitaTroca" as const, label: "Aceita troca" },
                  ]).map(({ key, label }) => (
                    <label key={key} className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-border accent-[color:var(--color-terracotta)]"
                        checked={form[key] as boolean}
                        onChange={(e) => upd(key, e.target.checked)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </section>

              {/* Situação Documental */}
              <section className="rounded-[10px] border border-border bg-card p-6">
                <SectionTitle>Situação Documental</SectionTitle>
                <div className="space-y-5">
                  <div>
                    <p className="mb-2 text-sm font-medium">Documento em nome de:</p>
                    <RadioGroup
                      name="docNome"
                      value={form.docNome}
                      onChange={(v) => upd("docNome", v)}
                      options={[
                        { value: "proprio", label: "Próprio" },
                        { value: "terceiro", label: "Terceiro" },
                        { value: "falecido", label: "Falecido" },
                        { value: "empresaExtinta", label: "Empresa extinta" },
                        { value: "desconhecido", label: "Desconhecido" },
                      ]}
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium">Transferências acumuladas:</p>
                    <RadioGroup
                      name="docTransferencias"
                      value={form.docTransferencias}
                      onChange={(v) => upd("docTransferencias", v)}
                      options={[
                        { value: "nenhuma", label: "Nenhuma" },
                        { value: "1a2", label: "1 a 2" },
                        { value: "3oumais", label: "3 ou mais" },
                        { value: "naosei", label: "Não sei" },
                      ]}
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium">IPVA:</p>
                    <RadioGroup
                      name="docIpva"
                      value={form.docIpva}
                      onChange={(v) => upd("docIpva", v)}
                      options={[
                        { value: "emDia", label: "Em dia" },
                        { value: "isentoAntiguidade", label: "Isento (antiguidade)" },
                        { value: "atrasado", label: "Atrasado" },
                        { value: "naoSeAplica", label: "Não se aplica" },
                      ]}
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium">Licenciamento:</p>
                    <RadioGroup
                      name="docLicenciamento"
                      value={form.docLicenciamento}
                      onChange={(v) => upd("docLicenciamento", v)}
                      options={[
                        { value: "emDia", label: "Em dia" },
                        { value: "atrasado", label: "Atrasado" },
                        { value: "sucata", label: "Sucata" },
                        { value: "semPlaca", label: "Sem placa" },
                      ]}
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium">Chassi:</p>
                    <RadioGroup
                      name="docChassi"
                      value={form.docChassi}
                      onChange={(v) => upd("docChassi", v)}
                      options={[
                        { value: "visivelLegivel", label: "Visível e legível" },
                        { value: "parcialmenteLegivel", label: "Parcialmente legível" },
                        { value: "ilegivel", label: "Ilegível" },
                        { value: "recarimbado", label: "Recarimbado" },
                        { value: "naoLocalizado", label: "Não localizado" },
                      ]}
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium">Motor:</p>
                    <RadioGroup
                      name="docMotor"
                      value={form.docMotor}
                      onChange={(v) => upd("docMotor", v)}
                      options={[
                        { value: "original", label: "Original" },
                        { value: "trocadoMesmaFamilia", label: "Trocado (mesma família)" },
                        { value: "trocadoDiferente", label: "Trocado (diferente)" },
                        { value: "semNumero", label: "Sem número" },
                      ]}
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium">Multas:</p>
                    <RadioGroup
                      name="docMultas"
                      value={form.docMultas}
                      onChange={(v) => upd("docMultas", v)}
                      options={[
                        { value: "nenhuma", label: "Nenhuma" },
                        { value: "comMultas", label: "Com multas" },
                        { value: "naoVerificado", label: "Não verificado" },
                      ]}
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium">Aceita ajudar na regularização?</p>
                    <RadioGroup
                      name="docAjuda"
                      value={form.docAjuda}
                      onChange={(v) => upd("docAjuda", v)}
                      options={[
                        { value: "sim", label: "Sim" },
                        { value: "parcialmente", label: "Parcialmente" },
                        { value: "nao", label: "Não" },
                      ]}
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Sidebar dicas */}
            <aside className="hidden lg:block">
              <div className="sticky top-32 rounded-[10px] border border-border bg-card p-5">
                <h3 className="font-serif text-base font-medium">
                  {form.category ? CATEGORY_INFO[form.category].label : "Dicas"}
                </h3>
                <ul className="mt-4 space-y-2">
                  {(form.category ? CATEGORY_INFO[form.category].tips : [
                    "Selecione a condição do veículo para ver dicas específicas",
                  ]).map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--color-cat-complete)]" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        )}

        {/* ═══════════ STEP 2 ═══════════ */}
        {step === 2 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">

              {/* Upload fotos */}
              <section className="rounded-[10px] border border-border bg-card p-6">
                <div className="mb-1 flex items-center justify-between">
                  <SectionTitle>Fotos</SectionTitle>
                  <span className={cn(
                    "text-sm font-medium",
                    form.photos.length >= 5 ? "text-[color:var(--color-terracotta)]" : "text-muted-foreground",
                  )}>
                    {form.photos.length} / 5
                  </span>
                </div>

                {/* Grid de fotos */}
                {form.photos.length > 0 && (
                  <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {form.photos.map((src, i) => (
                      <div key={i} className="group relative aspect-square overflow-hidden rounded-md border border-border">
                        <img src={src} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        {i === 0 && (
                          <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">Capa</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Dropzone */}
                <button
                  type="button"
                  disabled={form.photos.length >= 5}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "flex w-full flex-col items-center gap-3 rounded-[8px] border-2 border-dashed px-6 py-10 transition-colors",
                    form.photos.length >= 5
                      ? "cursor-not-allowed border-border opacity-50"
                      : "border-border hover:border-[color:var(--color-terracotta)] hover:bg-[color:var(--color-terracotta)]/5",
                  )}
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      {form.photos.length >= 5 ? "Limite de 5 fotos atingido" : "Clique para adicionar fotos"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, WEBP — máx. 5 fotos</p>
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={handleFileChange}
                />

                {/* Aviso LGPD */}
                <p className="mt-3 text-xs text-muted-foreground">
                  <strong>Aviso LGPD:</strong> As fotos enviadas podem conter dados EXIF (localização, data, dispositivo). Remova os metadados EXIF antes de enviar, se preferir proteger sua privacidade.
                </p>
              </section>

              {/* Descrição */}
              <section className="rounded-[10px] border border-border bg-card p-6">
                <div className="mb-1 flex items-center justify-between">
                  <SectionTitle>Descrição</SectionTitle>
                  <span className={cn(
                    "text-xs",
                    form.description.length > 1900 ? "text-[color:var(--color-terracotta)]" : "text-muted-foreground",
                  )}>
                    {form.description.length} / 2000
                  </span>
                </div>
                <Textarea
                  rows={10}
                  maxLength={2000}
                  placeholder="Descreva o veículo com detalhes: estado de conservação, histórico de manutenção, documentação, diferenciais..."
                  value={form.description}
                  onChange={(e) => upd("description", e.target.value)}
                  className="resize-none"
                />
              </section>
            </div>

            {/* Sidebar dicas contextuais */}
            <aside className="hidden lg:block">
              <div className="sticky top-32 rounded-[10px] border border-border bg-card p-5">
                <h3 className="font-serif text-base font-medium">Dicas para boas fotos</h3>
                <ul className="mt-4 space-y-2">
                  {(form.category ? CATEGORY_INFO[form.category].tips : [
                    "Fotografe em luz natural",
                    "Capture todos os ângulos externos",
                    "Inclua fotos do interior e painel",
                    "Foto do motor e do número do chassi",
                    "Mostre a documentação",
                  ]).map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--color-cat-complete)]" />
                      {tip}
                    </li>
                  ))}
                </ul>

                <div className="mt-5 border-t border-border pt-5">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Descrição eficaz</h4>
                  <ul className="mt-3 space-y-2">
                    {[
                      "Mencione o histórico de revisões",
                      "Seja honesto sobre defeitos",
                      "Cite origem e procedência",
                      "Informe condições de pagamento",
                    ].map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--color-cat-complete)]" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* ═══════════ STEP 3 ═══════════ */}
        {step === 3 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">

              {/* Preço */}
              <section className="rounded-[10px] border border-border bg-card p-6">
                <SectionTitle>Preço</SectionTitle>

                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <Label className="mb-1 block text-sm">Valor (R$)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                      <Input
                        className="pl-9"
                        placeholder="0,00"
                        disabled={form.semPreco}
                        value={form.price}
                        onChange={(e) => upd("price", e.target.value)}
                      />
                    </div>
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-border accent-[color:var(--color-terracotta)]"
                      checked={form.semPreco}
                      onChange={(e) => upd("semPreco", e.target.checked)}
                    />
                    Não informar preço
                  </label>
                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                  Clássicos são peças únicas — não existe tabela FIPE confiável. Use os campos abaixo para justificar seu valor de forma transparente.
                </p>
              </section>

              {/* Precificação guiada para clássicos */}
              <section className="rounded-[10px] border border-border bg-card p-6">
                <div className="mb-2 flex items-center gap-2">
                  <Gem className="h-5 w-5 text-[color:var(--color-terracotta)]" />
                  <SectionTitle>Precificação guiada do clássico</SectionTitle>
                </div>
                <p className="mb-5 text-sm text-muted-foreground">
                  Como reliquia, o valor depende de estado, originalidade e raridade. Responda os campos abaixo e justifique o preço pedido — isso aumenta a confiança do comprador.
                </p>

                <div className="space-y-5">
                  <FieldGroup label="Estado de conservação" required>
                    <div className="flex items-start gap-2 text-xs text-muted-foreground mb-2">
                      <ShieldCheck className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span>Como está hoje o veículo, em termos de carroceria, mecânica e acabamento.</span>
                    </div>
                    <RadioGroup
                      name="estadoConservacao"
                      value={form.estadoConservacao}
                      onChange={(v) => upd("estadoConservacao", v as EstadoConservacao)}
                      options={(Object.keys(ESTADO_LABELS) as EstadoConservacao[]).map((k) => ({
                        value: k, label: ESTADO_LABELS[k],
                      }))}
                    />
                  </FieldGroup>

                  <FieldGroup label="Originalidade" required>
                    <div className="flex items-start gap-2 text-xs text-muted-foreground mb-2">
                      <Star className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span>Quanto do veículo permanece original de fábrica (motor, câmbio, pintura, interior).</span>
                    </div>
                    <RadioGroup
                      name="originalidade"
                      value={form.originalidade}
                      onChange={(v) => upd("originalidade", v as Originalidade)}
                      options={(Object.keys(ORIGINALIDADE_LABELS) as Originalidade[]).map((k) => ({
                        value: k, label: ORIGINALIDADE_LABELS[k],
                      }))}
                    />
                  </FieldGroup>

                  <FieldGroup label="Raridade no mercado">
                    <div className="flex items-start gap-2 text-xs text-muted-foreground mb-2">
                      <Gem className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span>Quão difícil é encontrar outro exemplar similar à venda no Brasil.</span>
                    </div>
                    <RadioGroup
                      name="raridade"
                      value={form.raridade}
                      onChange={(v) => upd("raridade", v as Raridade)}
                      options={(Object.keys(RARIDADE_LABELS) as Raridade[]).map((k) => ({
                        value: k, label: RARIDADE_LABELS[k],
                      }))}
                    />
                  </FieldGroup>

                  <FieldGroup label="Justificativa do valor pedido">
                    <Textarea
                      rows={5}
                      maxLength={1000}
                      placeholder="Opcional — explique por que esse valor faz sentido: histórico, restauração, originalidade, raridade, etc."
                      value={form.justificativaPreco}
                      onChange={(e) => upd("justificativaPreco", e.target.value)}
                      className="resize-none"
                    />
                    <div className="mt-1 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Campo opcional</span>
                      <span className="text-muted-foreground">{form.justificativaPreco.length}/1000</span>
                    </div>
                  </FieldGroup>
                </div>

              </section>

              {/* Localização */}
              <section className="rounded-[10px] border border-border bg-card p-6">
                <SectionTitle>Localização</SectionTitle>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FieldGroup label="CEP">
                    <Input
                      placeholder="00000-000"
                      value={form.cep}
                      onChange={(e) => {
                        upd("cep", e.target.value);
                        lookupCep(e.target.value);
                      }}
                      maxLength={9}
                    />
                  </FieldGroup>
                  <FieldGroup label="Cidade" required>
                    <Input
                      placeholder="Cidade"
                      value={form.cidade}
                      onChange={(e) => upd("cidade", e.target.value)}
                    />
                  </FieldGroup>
                  <FieldGroup label="Estado">
                    <Input
                      placeholder="UF"
                      value={form.estado}
                      onChange={(e) => upd("estado", e.target.value)}
                      maxLength={2}
                    />
                  </FieldGroup>
                </div>

                {/* Raio */}
                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium">Raio de exibição</p>
                  <div className="flex flex-wrap gap-2">
                    {RAIOS.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => upd("raio", r)}
                        className={cn(
                          "rounded-full border px-4 py-1.5 text-sm transition-colors",
                          form.raio === r
                            ? "border-[color:var(--color-terracotta)] bg-[color:var(--color-terracotta)] text-white"
                            : "border-border hover:border-muted-foreground",
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* Contato */}
              <section className="rounded-[10px] border border-border bg-card p-6">
                <SectionTitle>Contato</SectionTitle>
                <div className="space-y-4">
                  <FieldGroup label="WhatsApp">
                    <Input
                      placeholder="(11) 99999-9999"
                      value={form.whatsapp}
                      onChange={(e) => upd("whatsapp", e.target.value)}
                    />
                  </FieldGroup>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-border accent-[color:var(--color-terracotta)]"
                      checked={form.exibirWhatsapp}
                      onChange={(e) => upd("exibirWhatsapp", e.target.checked)}
                    />
                    Exibir WhatsApp no anúncio
                  </label>
                </div>
              </section>

              {/* Plano */}
              <section className="rounded-[10px] border border-border bg-card p-6">
                <SectionTitle>Selecione seu plano</SectionTitle>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[
                    {
                      key: "gratuito" as const,
                      name: "Gratuito",
                      price: "R$ 0",
                      features: ["Anúncio publicado normalmente", "5 fotos por anúncio", "Validade: 30 dias"],
                    },
                    {
                      key: "premium" as const,
                      name: "Premium — Sempre no topo",
                      price: "R$ 59,90/mês",
                      features: [
                        "★ Seu anúncio sempre no topo da busca",
                        "Selo dourado de destaque",
                        "15 fotos por anúncio",
                        "Validade: 60 dias",
                      ],
                    },
                  ].map((plano) => (
                    <button
                      key={plano.key}
                      type="button"
                      onClick={() => upd("plano", plano.key)}
                      className={cn(
                        "flex flex-col rounded-[8px] border p-5 text-left transition-all",
                        form.plano === plano.key
                          ? "border-[color:var(--color-terracotta)] bg-[color:var(--color-terracotta)]/8 ring-1 ring-[color:var(--color-terracotta)]"
                          : "border-border hover:border-muted-foreground",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{plano.name}</span>
                        <span className={cn(
                          "text-sm font-medium",
                          form.plano === plano.key ? "text-[color:var(--color-terracotta)]" : "text-muted-foreground",
                        )}>
                          {plano.price}
                        </span>
                      </div>
                      <ul className="mt-3 space-y-1.5">
                        {plano.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle className="h-3.5 w-3.5 shrink-0 text-[color:var(--color-cat-complete)]" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar resumo */}
            <aside className="hidden lg:block">
              <div className="sticky top-32 rounded-[10px] border border-border bg-card p-5">
                <h3 className="font-serif text-base font-medium">Resumo</h3>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Veículo</span>
                    <span className="font-medium text-right">{form.brand} {form.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ano</span>
                    <span>{form.anoFab || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fotos</span>
                    <span>{form.photos.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plano</span>
                    <span className="capitalize">{form.plano}</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* ─── Navegação ─── */}
        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
          <Button
            variant="outline"
            onClick={() => step > 1 ? setStep((s) => (s - 1) as Step) : navigate({ to: "/" })}
          >
            {step === 1 ? "Cancelar" : "Voltar"}
          </Button>

          <div className="flex gap-3">
            {step === 3 && (
              <Button
                variant="outline"
                onClick={() => {
                  if (!validateStepInline(3)) return;
                  setShowPreview(true);
                }}
              >
                Pré-visualizar
              </Button>
            )}

            {step < 3 ? (
              <Button
                className="bg-[color:var(--color-terracotta)] text-white hover:bg-[color:var(--color-terracotta-dark)]"
                onClick={() => {
                  if (!validateStepInline(step)) return;
                  setStep((s) => (s + 1) as Step);
                }}
              >
                Próximo <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button
                className="bg-[color:var(--color-terracotta)] text-white hover:bg-[color:var(--color-terracotta-dark)]"
                onClick={handlePublish}
                disabled={stepHasErrors(3)}
                aria-disabled={stepHasErrors(3)}
              >
                Publicar anúncio
              </Button>
            )}
          </div>
        </div>
      </main>

      {/* ─── Modal preview ─── */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[12px] bg-background p-6 shadow-2xl">
            <button
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPreview(false)}
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="font-serif text-2xl">Pré-visualização do anúncio</h2>
            <p className="mt-1 text-sm text-muted-foreground">Assim seu anúncio aparecerá para os compradores</p>

            <div className="mt-5 space-y-4">
              {form.photos[0] && (
                <img
                  src={form.photos[0]}
                  alt="Capa"
                  className="h-56 w-full rounded-[8px] object-cover"
                />
              )}
              <h3 className="font-serif text-xl">
                {form.brand} {form.model} {form.anoFab}
              </h3>
              {!form.semPreco && form.price && (
                <p className="text-2xl font-bold text-[color:var(--color-terracotta)]">
                  R$ {parseFloat(form.price.replace(/\D/g, "") || "0").toLocaleString("pt-BR")}
                </p>
              )}
              {form.semPreco && <p className="text-muted-foreground">Preço a consultar</p>}
              <p className="text-sm text-muted-foreground">
                {form.cidade}{form.estado ? `, ${form.estado}` : ""} — {form.raio}
              </p>
              {form.description && (
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{form.description}</p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowPreview(false)}>Editar</Button>
              <Button
                className="bg-[color:var(--color-terracotta)] text-white hover:bg-[color:var(--color-terracotta-dark)]"
                onClick={() => { setShowPreview(false); handlePublish(); }}
              >
                Publicar agora
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

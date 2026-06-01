import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Lock, ShieldCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface LockedContentGateProps {
  title: string;
  subtitle?: string;
  photo?: string;
  redirectTo: string;
  /** Texto opcional sobre o tipo de conteúdo (ex.: "evento", "serviço", "artigo") */
  kind?: string;
  /** Benefícios mostrados na lista (sobrescreve os padrões) */
  benefits?: string[];
  onBack: () => void;
}

const DEFAULT_BENEFITS = [
  "Conteúdo completo e mídia em alta resolução",
  "Contato direto com o anunciante / organizador",
  "Salvar nos favoritos e receber atualizações",
];

/**
 * Variante genérica do gate de "Acesso bloqueado" usada por
 * eventos, serviços e blog. Compartilha o mesmo padrão visual do
 * LockedListingGate dos anúncios.
 */
export function LockedContentGate({
  title,
  subtitle,
  photo,
  redirectTo,
  kind = "conteúdo",
  benefits = DEFAULT_BENEFITS,
  onBack,
}: LockedContentGateProps) {
  return (
    <main
      className="mx-auto w-full max-w-2xl flex-1 px-6 py-10"
      data-testid="locked-content-gate"
      data-redirect-to={redirectTo}
    >
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      <div className="mt-6 overflow-hidden rounded-[14px] border border-border bg-card shadow-sm">
        {photo ? (
          <div className="relative aspect-[16/9] bg-secondary">
            <img src={photo} alt={title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 text-white">
              <h1 className="font-serif text-xl font-semibold leading-tight line-clamp-1">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-0.5 text-xs text-white/85 line-clamp-1">{subtitle}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 border-b border-border">
            <h1 className="font-serif text-xl font-semibold leading-tight">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#B85A30]/10">
              <Lock className="h-5 w-5 text-[#B85A30]" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-semibold leading-tight">Acesso bloqueado</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Pedimos seu login para ver os detalhes deste {kind} e permitir contato direto e
                seguro. Leva menos de 1 minuto.
              </p>
            </div>
          </div>

          <ul className="mt-5 space-y-2 text-sm">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 mt-0.5 text-[#1D6E4E] shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-2">
            <Button asChild size="lg" className="w-full bg-[#B85A30] text-white hover:bg-[#9a4a28] h-12">
              <Link to="/login" search={{ redirect: redirectTo }} data-testid="gate-login-link">
                Ver detalhes após entrar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full h-11">
              <Link to="/cadastro" search={{ redirect: redirectTo }} data-testid="gate-signup-link">
                <UserPlus className="mr-2 h-4 w-4" />
                Criar conta grátis
              </Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full h-10 text-muted-foreground"
              onClick={onBack}
              data-testid="gate-back-button"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>

          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            Você voltará automaticamente para esta página após entrar.
          </p>
        </div>
      </div>
    </main>
  );
}
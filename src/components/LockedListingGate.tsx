import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Car, Lock, MapPin, ShieldCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface LockedListingGateProps {
  listing: {
    id: string;
    title: string;
    city: string;
    state: string;
    photos: string[];
  };
  onBack: () => void;
}

/**
 * Tela de "Acesso bloqueado" exibida quando o visitante não está logado.
 * É um componente puro (apenas props) para facilitar testes.
 */
export function LockedListingGate({ listing, onBack }: LockedListingGateProps) {
  const previewPhoto = listing.photos[0];
  const redirectTo = `/anuncios/${listing.id}`;

  return (
    <main
      className="mx-auto w-full max-w-2xl flex-1 px-6 py-10"
      data-testid="locked-listing-gate"
      data-redirect-to={redirectTo}
    >
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para a busca
      </button>

      <div className="mt-6 overflow-hidden rounded-[14px] border border-border bg-card shadow-sm">
        <div className="relative aspect-[16/9] bg-secondary">
          {previewPhoto ? (
            <img src={previewPhoto} alt={listing.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Car className="h-20 w-20 text-muted-foreground/30" strokeWidth={1} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <h1 className="font-serif text-xl font-semibold leading-tight line-clamp-1">
              {listing.title}
            </h1>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-white/85">
              <MapPin className="h-3 w-3" />
              {listing.city}, {listing.state}
            </p>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-terracotta-soft)]/10">
              <Lock className="h-5 w-5 text-[color:var(--color-terracotta-soft)]" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-semibold leading-tight">Acesso bloqueado</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Pedimos seu login para proteger vendedores contra spam e permitir contato direto e
                seguro. Leva menos de 1 minuto.
              </p>
            </div>
          </div>

          <ul className="mt-5 space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 mt-0.5 text-[color:var(--color-cat-complete)] shrink-0" />
              <span>Galeria completa, ficha técnica e dossiê documental</span>
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 mt-0.5 text-[color:var(--color-cat-complete)] shrink-0" />
              <span>Contato direto com o vendedor por chat e telefone</span>
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 mt-0.5 text-[color:var(--color-cat-complete)] shrink-0" />
              <span>Salvar nos favoritos e acompanhar mudanças de preço</span>
            </li>
          </ul>

          <div className="mt-6 space-y-2">
            <Button asChild size="lg" className="w-full bg-[color:var(--color-terracotta-soft)] text-white hover:bg-[color:var(--color-terracotta-dark)] h-12">
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
              Voltar para a busca
            </Button>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Você voltará automaticamente para este anúncio após entrar.
          </p>
        </div>
      </div>
    </main>
  );
}
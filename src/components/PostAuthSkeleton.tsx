import { Loader2 } from "lucide-react";

export interface PostAuthSkeletonProps {
  redirect?: string;
  title?: string;
  subtitle?: string;
}

/**
 * Skeleton exibido após login/cadastro enquanto redireciona
 * para os detalhes do anúncio (ou para a home).
 */
export function PostAuthSkeleton({
  redirect,
  title = "Entrando…",
  subtitle = "Carregando sua área.",
}: PostAuthSkeletonProps) {
  const message = redirect
    ? "Carregando os detalhes do anúncio que você abriu."
    : subtitle;

  return (
    <main
      className="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center"
      data-testid="post-auth-skeleton"
    >
      <Loader2
        className="h-10 w-10 animate-spin text-[#B85A30]"
        data-testid="post-auth-spinner"
      />
      <h1 className="mt-6 font-serif text-2xl text-foreground">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground" data-testid="post-auth-message">
        {message}
      </p>
      <div className="mt-8 w-full space-y-3" data-testid="post-auth-bars">
        <div className="h-32 rounded-[10px] bg-[#E8E6E0] animate-pulse" />
        <div className="h-4 w-2/3 mx-auto rounded-full bg-[#E8E6E0] animate-pulse" />
        <div className="h-4 w-1/2 mx-auto rounded-full bg-[#E8E6E0] animate-pulse" />
      </div>
    </main>
  );
}

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { DemoSwitcher } from "@/components/DemoSwitcher";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-7xl">404</h1>
        <h2 className="mt-4 font-serif text-xl">Página não encontrada</h2>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-xl">Algo deu errado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Tente recarregar a página.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
            Tentar novamente
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ClassicosBR — Comprar e vender carros antigos no Brasil" },
      { name: "description", content: "Marketplace minimalista de carros clássicos e antigos no Brasil. Opala, Fusca, Galaxie, Kombi e muito mais." },
      { property: "og:title", content: "ClassicosBR — Comprar e vender carros antigos no Brasil" },
      { name: "twitter:title", content: "ClassicosBR — Comprar e vender carros antigos no Brasil" },
      { property: "og:description", content: "Marketplace minimalista de carros clássicos e antigos no Brasil. Opala, Fusca, Galaxie, Kombi e muito mais." },
      { name: "twitter:description", content: "Marketplace minimalista de carros clássicos e antigos no Brasil. Opala, Fusca, Galaxie, Kombi e muito mais." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/66fd22d5-2f6a-48f6-85dc-66a2470701c3/id-preview-2d43c2e0--02cba24d-1fb9-4850-8193-70eff19c89b2.lovable.app-1779755767967.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/66fd22d5-2f6a-48f6-85dc-66a2470701c3/id-preview-2d43c2e0--02cba24d-1fb9-4850-8193-70eff19c89b2.lovable.app-1779755767967.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster position="top-right" richColors duration={3000} />
      <DemoSwitcher />
    </QueryClientProvider>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Clock, BookOpen, ArrowRight, ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContactLeadDialog } from "@/components/ContactLeadDialog";
import { useAppStore } from "@/store/app-store";
import { formatDate, formatPrice } from "@/lib/format";
import { CATEGORY_LABELS } from "@/lib/types";

export const Route = createFileRoute("/blog/$slug")({ component: BlogPostPage });

const CATEGORY_CHIP_COLORS: Record<string, string> = {
  Cultura: "bg-purple-100 text-purple-700 border-purple-200",
  Guias: "bg-[color:var(--color-cat-complete)]/10 text-[color:var(--color-cat-complete)] border-[color:var(--color-cat-complete)]/20",
  Mercado: "bg-[color:var(--color-cat-todo)]/10 text-[color:var(--color-cat-todo)] border-[color:var(--color-cat-todo)]/20",
  Restauração: "bg-orange-100 text-orange-700 border-orange-200",
  Documentação: "bg-amber-100 text-amber-700 border-amber-200",
  Peças: "bg-red-100 text-red-700 border-red-200",
  Manutenção: "bg-teal-100 text-teal-700 border-teal-200",
};

function CategoryChip({ categoria }: { categoria: string }) {
  const cls = CATEGORY_CHIP_COLORS[categoria] ?? "bg-secondary text-muted-foreground border-border";
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cls}`}>
      {categoria}
    </span>
  );
}

function BlogPostPage() {
  const { slug } = Route.useParams();
  const { blogPosts, listings } = useAppStore();

  const post = blogPosts.find((p) => p.slug === slug && p.status === "Publicado");

  if (!post) {
    return (
      <div className="min-h-screen bg-[color:var(--color-surface-cream)]">
        <Header />
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <BookOpen className="h-14 w-14 mx-auto mb-6 text-muted-foreground/30" />
          <h2 className="font-serif text-3xl mb-3">Artigo não encontrado</h2>
          <p className="text-muted-foreground text-sm mb-8">
            O artigo que você procura não existe ou foi removido.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-[color:var(--color-terracotta)] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar ao Blog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Related listings
  const relatedListings = post.anunciosRelacionados
    .map((id) => listings.find((l) => l.id === id && l.status === "ativo"))
    .filter(Boolean) as typeof listings;

  // Other published posts (excluding current)
  const otherPosts = blogPosts
    .filter((p) => p.status === "Publicado" && p.slug !== slug)
    .slice(0, 5);

  const paragraphs = post.conteudo.trim().split(/\n\n+/);

  return (
    <div className="min-h-screen bg-[color:var(--color-surface-cream)]">
      <Header />
      <main id="main-content">
        <div className="mx-auto max-w-6xl px-6 py-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8">
            <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground/60">{post.categoria}</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground line-clamp-1 max-w-xs">{post.titulo}</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Left column — article */}
            <article className="flex-1 min-w-0">
              {/* Cover image */}
              <div className="aspect-[16/9] overflow-hidden rounded-xl bg-secondary mb-8">
                <img
                  src={post.imagemCapa}
                  alt={post.titulo}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Meta */}
              <div className="mb-3">
                <CategoryChip categoria={post.categoria} />
              </div>
              <h1 className="font-serif text-3xl md:text-4xl leading-tight mb-4">{post.titulo}</h1>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-8 pb-6 border-b border-[color:var(--color-border-cream)]">
                <span>{formatDate(post.dataPublicacao)}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.tempoLeitura} de leitura
                </span>
                <span className="capitalize">{post.categoria}</span>
              </div>

              {/* Content */}
              <div className="space-y-5">
                {paragraphs.map((para, i) => (
                  <p key={i} className="text-sm md:text-base text-foreground/80 leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-12 rounded-xl bg-[color:var(--color-charcoal)] text-white p-6 text-center">
                <p className="font-serif text-xl mb-2">Encontre um clássico</p>
                <p className="text-white/60 text-sm mb-5">
                  Navegue por anúncios verificados com histórico documental transparente.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link
                    to="/anuncios"
                    className="inline-flex items-center gap-2 rounded-lg bg-[color:var(--color-terracotta)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[color:var(--color-terracotta)]/90 transition-colors"
                  >
                    Ver anúncios <ArrowRight className="h-4 w-4" />
                  </Link>
                  <ContactLeadDialog
                    kind="artigo"
                    contextTitle={post.titulo}
                    triggerLabel="Falar com um especialista"
                    variant="outline"
                  />
                </div>
              </div>
            </article>

            {/* Right column — sidebar */}
            <aside className="lg:w-80 shrink-0 space-y-8">
              {/* Related listings */}
              {relatedListings.length > 0 && (
                <div className="rounded-xl border border-[color:var(--color-border-cream)] bg-white p-5 shadow-sm">
                  <h3 className="font-serif text-base mb-4">Anúncios relacionados</h3>
                  <div className="space-y-4">
                    {relatedListings.slice(0, 3).map((listing) => (
                      <Link
                        key={listing.id}
                        to="/anuncios/$id"
                        params={{ id: listing.id }}
                        className="flex gap-3 group"
                      >
                        <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-secondary">
                          {listing.photos[0] && (
                            <img
                              src={listing.photos[0]}
                              alt={listing.title}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-[color:var(--color-terracotta)] transition-colors">
                            {listing.title}
                          </p>
                          <p className="text-xs text-[color:var(--color-cat-complete)] font-semibold mt-1">
                            {formatPrice(listing.price)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {listing.city}, {listing.state}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Other articles */}
              {otherPosts.length > 0 && (
                <div className="rounded-xl border border-[color:var(--color-border-cream)] bg-white p-5 shadow-sm">
                  <h3 className="font-serif text-base mb-4">Outros artigos</h3>
                  <div className="space-y-3">
                    {otherPosts.map((p) => (
                      <Link
                        key={p.id}
                        to="/blog/$slug"
                        params={{ slug: p.slug }}
                        className="flex gap-3 group"
                      >
                        <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-secondary">
                          <img
                            src={p.imagemCapa}
                            alt={p.titulo}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium leading-snug line-clamp-2 group-hover:text-[color:var(--color-terracotta)] transition-colors">
                            {p.titulo}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" /> {p.tempoLeitura}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link
                    to="/blog"
                    className="mt-4 block text-center text-xs text-[color:var(--color-terracotta)] hover:underline"
                  >
                    Ver todos os artigos →
                  </Link>
                </div>
              )}

              {/* Security promo */}
              <div className="rounded-xl border border-[color:var(--color-cat-todo)]/20 bg-[color:var(--color-cat-todo)]/5 p-5">
                <p className="text-sm font-semibold text-[color:var(--color-cat-todo)] mb-2">🔒 Compra segura</p>
                <p className="text-xs text-[color:var(--color-cat-todo)]/80 leading-relaxed mb-3">
                  Negocie sempre pelo chat da plataforma. Nunca pague antes de ver o veículo.
                </p>
                <Link
                  to="/compra-segura"
                  className="text-xs text-[color:var(--color-cat-todo)] underline underline-offset-2 hover:text-[color:var(--color-cat-todo)]/80"
                >
                  Ver guia completo →
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

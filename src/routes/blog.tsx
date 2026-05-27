import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, BookOpen } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAppStore } from "@/store/app-store";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/blog")({ component: Blog });

const ALL_CATEGORIES = ["Todos", "Cultura", "Guias", "Mercado", "Restauração", "Documentação", "Peças", "Manutenção"];

const CATEGORY_CHIP_COLORS: Record<string, string> = {
  Cultura: "bg-purple-100 text-purple-700 border-purple-200",
  Guias: "bg-[#1D6E4E]/10 text-[#1D6E4E] border-[#1D6E4E]/20",
  Mercado: "bg-[#185FA5]/10 text-[#185FA5] border-[#185FA5]/20",
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

function Blog() {
  const [cat, setCat] = useState("Todos");
  const { blogPosts } = useAppStore();

  // Only show published posts to public users
  const published = blogPosts.filter((p) => p.status === "Publicado");
  const filtered = cat === "Todos" ? published : published.filter((p) => p.categoria === cat);

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-[color:var(--color-charcoal)] text-white py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-[color:var(--color-terracotta)]/20">
                <BookOpen className="h-5 w-5 text-[color:var(--color-terracotta)]" />
              </div>
              <span className="text-sm font-medium text-white/50 uppercase tracking-widest">Blog</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl mb-3">Blog ClassicosBR</h1>
            <p className="text-white/60 text-lg max-w-xl">
              Histórias, guias e análises do universo dos clássicos brasileiros. Conteúdo para colecionadores,
              restauradores e apaixonados por automóveis.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-6 py-10">
          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-10">
            {ALL_CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium border transition-colors ${
                  cat === c
                    ? "bg-[color:var(--color-terracotta)] text-white border-[color:var(--color-terracotta)]"
                    : "border-[#E8E6E0] text-muted-foreground hover:border-foreground/30 hover:text-foreground bg-white"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Count label */}
          {filtered.length > 0 && (
            <p className="text-sm text-muted-foreground mb-6">
              {filtered.length} artigo{filtered.length !== 1 ? "s" : ""} {cat !== "Todos" ? `em ${cat}` : "publicados"}
            </p>
          )}

          {/* Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((post) => (
                <Link
                  key={post.id}
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="group flex flex-col overflow-hidden rounded-xl border border-[#E8E6E0] bg-white hover:border-foreground/25 transition-all hover:shadow-md"
                >
                  {/* Cover image */}
                  <div className="aspect-[16/9] overflow-hidden bg-secondary">
                    <img
                      src={post.imagemCapa}
                      alt={post.titulo}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-2">
                      <CategoryChip categoria={post.categoria} />
                    </div>
                    <h2 className="font-serif text-lg leading-snug group-hover:text-[color:var(--color-terracotta)] transition-colors line-clamp-2">
                      {post.titulo}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="mt-auto pt-4 flex items-center gap-4 text-xs text-muted-foreground border-t border-[#E8E6E0] mt-4">
                      <span>{formatDate(post.dataPublicacao)}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.tempoLeitura}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="font-serif text-xl mb-2">Nenhum artigo nesta categoria</h3>
              <p className="text-muted-foreground text-sm mb-5">
                Tente outra categoria ou volte em breve para novos conteúdos.
              </p>
              <button
                onClick={() => setCat("Todos")}
                className="text-sm text-[color:var(--color-terracotta)] hover:underline"
              >
                Ver todos os artigos
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

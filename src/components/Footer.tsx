import { Link } from "@tanstack/react-router";
import { Car, Shield, BookOpen, Mail, Instagram, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-[color:var(--color-charcoal)] text-white/75">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-serif text-xl font-semibold text-white">ClassicosBR</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-terracotta)]" />
            </div>
            <p className="text-sm leading-relaxed text-white/70">
              O marketplace definitivo para compra e venda de carros clássicos e antigos no Brasil.
            </p>
            <div className="mt-5 flex gap-3">
              <a href="#" aria-label="Instagram do ClassicosBR" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                <Instagram className="h-3.5 w-3.5" />
              </a>
              <a href="#" aria-label="YouTube do ClassicosBR" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                <Youtube className="h-3.5 w-3.5" />
              </a>
              <a href="#" aria-label="E-mail de contato" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                <Mail className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-white/55">Marketplace</p>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/anuncios" className="hover:text-white transition-colors flex items-center gap-1.5"><Car className="h-3 w-3" /> Explorar carros</Link></li>
              <li><Link to="/anunciar" className="hover:text-white transition-colors">Anunciar veículo</Link></li>
              <li><Link to="/comparar" className="hover:text-white transition-colors">Comparar modelos</Link></li>
              <li><Link to="/favoritos" className="hover:text-white transition-colors">Meus favoritos</Link></li>
            </ul>
          </div>

          {/* Informações */}
          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-white/55">Informações</p>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/compra-segura" className="hover:text-white transition-colors flex items-center gap-1.5"><Shield className="h-3 w-3" /> Compra segura</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors flex items-center gap-1.5"><BookOpen className="h-3 w-3" /> Blog e dicas</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Política de privacidade</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Termos de uso</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-white/55">Newsletter</p>
            <p className="text-sm text-white/70 mb-3">Receba os melhores clássicos na sua caixa de entrada.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="seu@email.com"
                className="flex-1 min-w-0 rounded-lg bg-white/10 border border-white/15 px-3 py-2 text-sm text-white placeholder:text-white/55 focus:outline-none focus:border-[color:var(--color-terracotta)]/60"
              />
              <button className="rounded-lg btn-terra px-3 py-2 text-sm font-medium text-white shrink-0">
                OK
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
          <p className="text-xs text-white/60">© 2025 ClassicosBR. Todos os direitos reservados.</p>
          <div className="flex items-center gap-3 text-xs text-white/60">
            <Link to="/compra-segura" className="hover:text-white transition-colors">Compra segura</Link>
            <span className="h-1 w-1 rounded-full bg-white/30" />
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <span className="h-1 w-1 rounded-full bg-white/30" />
            <a href="#" className="hover:text-white transition-colors">Termos</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

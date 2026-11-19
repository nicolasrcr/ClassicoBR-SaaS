import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Heart, MessageCircle, User, LogOut, Car, Settings, Plus,
  Menu, X, Compass, Calendar, Wrench, BookOpen, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "./Logo";
import { useAppStore, useCurrentUser } from "@/store/app-store";
import { useChatStore } from "@/store/chat-store";

export function Header() {
  const user = useCurrentUser();
  const logout = useAppStore((s) => s.logout);
  const unreadFn = useChatStore((s) => s.unreadCount);
  const unread = user ? unreadFn(user.id) : 0;
  const [mobileOpen, setMobileOpen] = useState(false);

  const NAV_LINKS = [
    { to: "/anuncios", label: "Explorar", icon: Compass },
    { to: "/eventos", label: "Eventos", icon: Calendar },
    { to: "/servicos", label: "Serviços & Peças", icon: Wrench },
    { to: "/blog", label: "Blog", icon: BookOpen },
    { to: "/compra-segura", label: "Compra segura", icon: ShieldCheck },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-[color:var(--color-charcoal)] border-b border-white/10">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="font-serif text-xl font-semibold text-white tracking-tight">ClassicosBR</span>
          <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-[color:var(--color-terracotta)]" />
        </Link>

        {/* Nav links (desktop) */}
        <nav aria-label="Navegação principal" className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: false }}
              activeProps={{
                className:
                  "px-3 py-1.5 text-sm text-white bg-white/10 rounded-md font-medium border-b-2 border-[color:var(--color-terracotta)]",
              }}
              inactiveProps={{
                className:
                  "px-3 py-1.5 text-sm text-white/85 hover:text-white transition-colors rounded-md hover:bg-white/8",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {user.role === "admin" && (
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex text-white/85 hover:text-white hover:bg-white/10">
                  <Link to="/admin">Admin</Link>
                </Button>
              )}

              {/* Chat */}
              <Button asChild variant="ghost" size="icon" aria-label="Mensagens" className="relative text-white/85 hover:text-white hover:bg-white/10 h-9 w-9">
                <Link to="/chat" aria-label="Mensagens">
                  <MessageCircle className="h-4 w-4" />
                  {unread > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[color:var(--color-terracotta)] text-xs font-bold text-white">
                      {unread}
                    </span>
                  )}
                </Link>
              </Button>

              {/* Favorites */}
              <Button asChild variant="ghost" size="icon" aria-label="Favoritos" className="text-white/85 hover:text-white hover:bg-white/10 h-9 w-9">
                <Link to="/favoritos" aria-label="Favoritos">
                  <Heart className="h-4 w-4" />
                </Link>
              </Button>

              {/* Anunciar */}
              <Link
                to="/anunciar"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-md btn-terra px-4 py-1.5 text-sm font-medium text-white"
              >
                <Plus className="h-3.5 w-3.5" />
                Anunciar
              </Link>

              {/* Avatar menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Menu da conta" className="h-9 w-9 rounded-full hover:bg-white/10">
                    <Avatar className="h-7 w-7 ring-2 ring-white/20">
                      <AvatarFallback className="bg-[color:var(--color-terracotta)] text-white text-xs font-bold">
                        {user.name[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 mt-1">
                  <div className="px-2 py-1.5 border-b border-border mb-1">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to="/minha-conta" className="flex items-center gap-2">
                      <User className="h-4 w-4" /> Minha conta
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/minha-conta" className="flex items-center gap-2">
                      <Car className="h-4 w-4" /> Meus anúncios
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" /> Painel admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="flex items-center gap-2 text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex text-white/85 hover:text-white hover:bg-white/10">
                <Link to="/login">Entrar</Link>
              </Button>
              <Link
                to="/cadastro"
                className="hidden sm:inline-flex items-center rounded-md bg-white px-4 py-1.5 text-sm font-semibold text-[color:var(--color-charcoal)] hover:bg-white/90 transition-colors"
              >
                Criar conta
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={mobileOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
                className="md:hidden text-white/90 hover:text-white hover:bg-white/10 h-10 w-10"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[88%] max-w-sm bg-[color:var(--color-charcoal)] border-r border-white/10 p-0 text-white"
            >
              <div className="flex h-full flex-col">
                <div className="px-6 py-5 border-b border-white/10">
                  <span className="font-serif text-xl font-semibold text-white">ClassicosBR</span>
                  <span className="ml-2 inline-block h-1 w-1 rounded-full bg-[color:var(--color-terracotta)] align-middle" />
                </div>

                <nav aria-label="Navegação mobile" className="flex-1 overflow-y-auto px-3 py-3">
                  {NAV_LINKS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        activeOptions={{ exact: false }}
                        activeProps={{
                          className:
                            "flex items-center gap-3 rounded-md px-3 min-h-12 text-sm font-medium bg-white/10 text-white border-l-2 border-[color:var(--color-terracotta)]",
                        }}
                        inactiveProps={{
                          className:
                            "flex items-center gap-3 rounded-md px-3 min-h-12 text-sm text-white/85 hover:bg-white/8 hover:text-white transition-colors",
                        }}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </Link>
                    );
                  })}

                  {user && (
                    <>
                      <div className="my-3 border-t border-white/10" />
                      <Link
                        to="/minha-conta"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 rounded-md px-3 min-h-12 text-sm text-white/85 hover:bg-white/8 hover:text-white"
                      >
                        <User className="h-4 w-4 shrink-0" /> Minha conta
                      </Link>
                      <Link
                        to="/minha-conta"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 rounded-md px-3 min-h-12 text-sm text-white/85 hover:bg-white/8 hover:text-white"
                      >
                        <Car className="h-4 w-4 shrink-0" /> Meus anúncios
                      </Link>
                      <Link
                        to="/chat"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 rounded-md px-3 min-h-12 text-sm text-white/85 hover:bg-white/8 hover:text-white"
                      >
                        <MessageCircle className="h-4 w-4 shrink-0" /> Mensagens
                        {unread > 0 && (
                          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[color:var(--color-terracotta)] px-1.5 text-xs font-bold text-white">
                            {unread}
                          </span>
                        )}
                      </Link>
                      <Link
                        to="/favoritos"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 rounded-md px-3 min-h-12 text-sm text-white/85 hover:bg-white/8 hover:text-white"
                      >
                        <Heart className="h-4 w-4 shrink-0" /> Favoritos
                      </Link>
                      {user.role === "admin" && (
                        <Link
                          to="/admin"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 rounded-md px-3 min-h-12 text-sm text-white/85 hover:bg-white/8 hover:text-white"
                        >
                          <Settings className="h-4 w-4 shrink-0" /> Painel admin
                        </Link>
                      )}
                    </>
                  )}
                </nav>

                <div className="border-t border-white/10 p-4 space-y-2">
                  {user ? (
                    <>
                      <Link
                        to="/anunciar"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-center gap-2 rounded-md btn-terra px-4 min-h-12 text-sm font-semibold text-white"
                      >
                        <Plus className="h-4 w-4" /> Anunciar meu carro
                      </Link>
                      <button
                        onClick={() => { logout(); setMobileOpen(false); }}
                        className="flex w-full items-center justify-center gap-2 rounded-md px-4 min-h-12 text-sm font-medium text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors"
                      >
                        <LogOut className="h-4 w-4" /> Sair
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/cadastro"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-center rounded-md bg-white px-4 min-h-12 text-sm font-semibold text-[color:var(--color-charcoal)] hover:bg-white/90"
                      >
                        Criar conta
                      </Link>
                      <Link
                        to="/login"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-center rounded-md border border-white/20 px-4 min-h-12 text-sm font-medium text-white hover:bg-white/5"
                      >
                        Entrar
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

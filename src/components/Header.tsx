import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle, User, LogOut, Car, Settings, Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "./Logo";
import { useAppStore, useCurrentUser } from "@/store/app-store";
import { useChatStore } from "@/store/chat-store";

export function Header() {
  const user = useCurrentUser();
  const logout = useAppStore((s) => s.logout);
  const unreadFn = useChatStore((s) => s.unreadCount);
  const unread = user ? unreadFn(user.id) : 0;

  return (
    <header className="sticky top-0 z-40 bg-[color:var(--color-charcoal)] border-b border-white/10">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="font-serif text-xl font-semibold text-white tracking-tight">ClassicosBR</span>
          <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-[color:var(--color-terracotta)]" />
        </Link>

        {/* Nav links (desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { to: "/anuncios", label: "Explorar" },
            { to: "/eventos", label: "Eventos" },
            { to: "/servicos", label: "Serviços & Peças" },
            { to: "/blog", label: "Blog" },
            { to: "/compra-segura", label: "Compra segura" },
          ].map((item) => (
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
                  "px-3 py-1.5 text-sm text-white/70 hover:text-white transition-colors rounded-md hover:bg-white/8",
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
                <Button asChild variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                  <Link to="/admin">Admin</Link>
                </Button>
              )}

              {/* Chat */}
              <Button asChild variant="ghost" size="icon" className="relative text-white/70 hover:text-white hover:bg-white/10 h-9 w-9">
                <Link to="/chat">
                  <MessageCircle className="h-4 w-4" />
                  {unread > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[color:var(--color-terracotta)] text-[10px] font-bold text-white">
                      {unread}
                    </span>
                  )}
                </Link>
              </Button>

              {/* Favorites */}
              <Button asChild variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 h-9 w-9">
                <Link to="/favoritos">
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
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-white/10">
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
              <Button asChild variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
                <Link to="/login">Entrar</Link>
              </Button>
              <Link
                to="/cadastro"
                className="inline-flex items-center rounded-md bg-white px-4 py-1.5 text-sm font-semibold text-[color:var(--color-charcoal)] hover:bg-white/90 transition-colors"
              >
                Criar conta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

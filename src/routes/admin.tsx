import { Link, Outlet, useLocation, useNavigate, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BarChart3, FileText, Flag, LogOut, MessageSquare, Newspaper,
  Settings, Shield, ShieldCheck, Users, UserPlus, Wallet, Menu, X, ChevronRight, Home,
} from "lucide-react";
import { useAppStore, useCurrentUser } from "@/store/app-store";
import { mockReports, mockFlaggedListings } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({ component: AdminLayout });

function AdminLayout() {
  const user = useCurrentUser();
  const logout = useAppStore((s) => s.logout);
  const navigate = useNavigate();
  const loc = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const openReports = mockReports.filter((r) => r.status === "aberta").length;
  const activeFlags = mockFlaggedListings.filter((f) => !f.absolvido).length;

  const NAV = [
    { to: "/admin", label: "Dashboard", icon: BarChart3, exact: true },
    { to: "/admin/anuncios", label: "Anúncios", icon: FileText },
    { to: "/admin/usuarios", label: "Usuários", icon: Users },
    { to: "/admin/cadastros-pendentes", label: "Cadastros Pendentes", icon: UserPlus },
    { to: "/admin/denuncias", label: "Denúncias", icon: Flag, badge: openReports },
    { to: "/admin/moderacao", label: "Moderação", icon: ShieldCheck },
    { to: "/admin/chat", label: "Chat & Suporte", icon: MessageSquare },
    { to: "/admin/seguranca", label: "Segurança", icon: Shield, badge: activeFlags },
    { to: "/admin/planos", label: "Planos & Pagamentos", icon: Wallet },
    { to: "/admin/blog", label: "Blog", icon: Newspaper },
    { to: "/admin/configuracoes", label: "Configurações", icon: Settings },
  ];

  const currentSection =
    [...NAV].sort((a, b) => b.to.length - a.to.length).find((n) =>
      n.exact ? loc.pathname === n.to : loc.pathname.startsWith(n.to)
    ) ?? NAV[0];
  const isRoot = loc.pathname === "/admin";

  useEffect(() => {
    if (!user || user.role !== "admin") navigate({ to: "/" });
  }, [user, navigate]);

  if (!user || user.role !== "admin") return null;

  const NavItems = () => (
    <>
      {NAV.map((n) => {
        const Icon = n.icon;
        const active = n.exact ? loc.pathname === n.to : loc.pathname.startsWith(n.to);
        return (
          <Link
            key={n.to}
            to={n.to}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
              active
                ? "bg-[color:var(--color-terracotta-soft)] text-white font-medium"
                : "text-[color:var(--color-surface-cream)]/70 hover:bg-white/5 hover:text-[color:var(--color-surface-cream)]",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{n.label}</span>
            {n.badge ? (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                {n.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-[color:var(--color-admin-bg)] md:flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-[color:var(--color-charcoal-admin)] text-[color:var(--color-surface-cream)] fixed inset-y-0 left-0 z-30">
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-xl text-[color:var(--color-terracotta-soft)]">ClassicosBR</span>
            <span className="text-xs uppercase tracking-widest text-white/40">Admin</span>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          <NavItems />
        </nav>
        <div className="border-t border-white/10 p-3">
          <button
            onClick={() => { logout(); navigate({ to: "/" }); }}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-[color:var(--color-surface-cream)]/60 hover:bg-white/5 hover:text-[color:var(--color-surface-cream)]"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="flex items-center justify-between bg-[color:var(--color-charcoal-admin)] px-4 py-3 md:hidden">
        <span className="font-serif text-lg text-[color:var(--color-terracotta-soft)]">ClassicosBR</span>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-[color:var(--color-surface-cream)]/70 hover:text-[color:var(--color-surface-cream)]"
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 flex w-72 flex-col bg-[color:var(--color-charcoal-admin)] text-[color:var(--color-surface-cream)]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <span className="font-serif text-xl text-[color:var(--color-terracotta-soft)]">ClassicosBR</span>
              <button onClick={() => setMobileOpen(false)} className="text-white/60 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
              <NavItems />
            </nav>
            <div className="border-t border-white/10 p-3">
              <button
                onClick={() => { logout(); navigate({ to: "/" }); setMobileOpen(false); }}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-[color:var(--color-surface-cream)]/60 hover:bg-white/5 hover:text-[color:var(--color-surface-cream)]"
              >
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </div>
          </aside>
        </div>
      )}

      <main id="main-content" className="flex-1 md:ml-64 overflow-auto">
        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="sticky top-0 z-20 border-b border-border bg-[color:var(--color-admin-bg)]/95 backdrop-blur px-4 md:px-6 py-3"
        >
          <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <Link to="/admin" className="flex items-center gap-1 hover:text-foreground transition-colors">
                <Home className="h-3.5 w-3.5" />
                <span>Admin</span>
              </Link>
            </li>
            {!isRoot && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" aria-hidden="true" />
                <li aria-current="page" className="font-semibold text-foreground">
                  {currentSection.label}
                </li>
              </>
            )}
          </ol>
        </nav>
        <Outlet />
      </main>
    </div>
  );
}

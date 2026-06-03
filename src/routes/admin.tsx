import { Link, Outlet, useLocation, useNavigate, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BarChart3, FileText, Flag, LogOut, MessageSquare, Newspaper,
  Settings, Shield, ShieldCheck, Users, UserPlus, Wallet, Menu, X,
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
                ? "bg-[#B85A30] text-white font-medium"
                : "text-[#FAF9F6]/70 hover:bg-white/5 hover:text-[#FAF9F6]",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{n.label}</span>
            {n.badge ? (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {n.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-[#F4F2EE] md:flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-[#1a1a1a] text-[#FAF9F6] fixed inset-y-0 left-0 z-30">
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-xl text-[#B85A30]">ClassicosBR</span>
            <span className="text-[10px] uppercase tracking-widest text-white/40">Admin</span>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          <NavItems />
        </nav>
        <div className="border-t border-white/10 p-3">
          <button
            onClick={() => { logout(); navigate({ to: "/" }); }}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-[#FAF9F6]/60 hover:bg-white/5 hover:text-[#FAF9F6]"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="flex items-center justify-between bg-[#1a1a1a] px-4 py-3 md:hidden">
        <span className="font-serif text-lg text-[#B85A30]">ClassicosBR</span>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-[#FAF9F6]/70 hover:text-[#FAF9F6]"
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
          <aside className="relative z-10 flex w-72 flex-col bg-[#1a1a1a] text-[#FAF9F6]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <span className="font-serif text-xl text-[#B85A30]">ClassicosBR</span>
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
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-[#FAF9F6]/60 hover:bg-white/5 hover:text-[#FAF9F6]"
              >
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </div>
          </aside>
        </div>
      )}

      <main id="main-content" className="flex-1 md:ml-64 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

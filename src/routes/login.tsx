import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const navigate = useNavigate();
  const loginAs = useAppStore((s) => s.loginAs);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function clearError(key: string) {
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!email.trim())
      e.email = "Informe seu e-mail.";
    else if (!email.includes("@") || !email.includes("."))
      e.email = "Informe um e-mail válido.";
    if (!senha || senha.length < 4)
      e.senha = "Informe sua senha.";
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      // Demo: email com "admin" → login como admin (u1), demais → u1 (usuário padrão logado)
      const userId = email.toLowerCase().includes("admin") ? "u1" : "u1";
      loginAs(userId);
      toast.success("Bem-vindo de volta!");
      navigate({ to: "/" });
    }, 700);
  }

  function handleGoogle() {
    loginAs("u1");
    toast.success("Login com Google realizado!");
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Header />
      <main className="mx-auto flex max-w-md flex-col px-6 py-14">
        {/* Title */}
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-full bg-[#B85A30]/10 flex items-center justify-center shrink-0">
            <LogIn className="h-5 w-5 text-[#B85A30]" />
          </div>
          <div>
            <h1 className="font-serif text-3xl text-foreground">Entrar</h1>
            <p className="text-sm text-muted-foreground">Acesse sua conta ClassicosBR</p>
          </div>
        </div>

        <div className="mt-8 rounded-[12px] border border-[#E8E6E0] bg-white p-6 shadow-sm space-y-4">
          {/* Google */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-10 flex items-center gap-2 border-[#E8E6E0] hover:bg-[#FAF9F6] font-medium"
            onClick={handleGoogle}
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Entrar com Google
          </Button>

          <div className="relative flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex-1 h-px bg-[#E8E6E0]" />
            <span>ou entre com e-mail</span>
            <span className="flex-1 h-px bg-[#E8E6E0]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* E-mail */}
            <div>
              <Label className="mb-1.5 block text-sm font-medium">E-mail</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
                placeholder="voce@email.com"
                autoComplete="email"
                className={errors.email ? "border-[#993C1D] focus-visible:ring-[#993C1D]/20" : ""}
              />
              {errors.email && <p className="mt-1 text-xs text-[#993C1D]">{errors.email}</p>}
              <p className="mt-1 text-[11px] text-muted-foreground">
                Demo: qualquer e-mail funciona. Use "admin@..." para acesso admin.
              </p>
            </div>

            {/* Senha */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-sm font-medium">Senha</Label>
                <Link
                  to="/esqueci-senha"
                  className="text-xs text-[#185FA5] hover:underline"
                >
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={showSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => { setSenha(e.target.value); clearError("senha"); }}
                  placeholder="Sua senha"
                  autoComplete="current-password"
                  className={`pr-10 ${errors.senha ? "border-[#993C1D] focus-visible:ring-[#993C1D]/20" : ""}`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowSenha((v) => !v)}
                >
                  {showSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.senha && <p className="mt-1 text-xs text-[#993C1D]">{errors.senha}</p>}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#B85A30] hover:bg-[#993C1D] text-white font-medium h-10"
            >
              {loading ? "Entrando…" : "Entrar"}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground pt-1">
            Não tem conta?{" "}
            <Link to="/cadastro" className="text-[#B85A30] underline hover:opacity-80 font-medium">
              Criar conta grátis
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

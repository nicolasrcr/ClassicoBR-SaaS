import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PostAuthSkeleton } from "@/components/PostAuthSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/cadastro")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : "",
  }),
  component: Cadastro,
});

function PasswordStrength({ senha }: { senha: string }) {
  const hasLen = senha.length >= 8;
  const hasUpper = /[A-Z]/.test(senha);
  const hasSpecial = /[0-9!@#$%^&*]/.test(senha);
  const score = [hasLen, hasUpper, hasSpecial].filter(Boolean).length;
  const colors = ["bg-muted", "bg-[color:var(--color-terracotta-deep)]", "bg-[color:var(--color-terracotta-soft)]", "bg-[color:var(--color-cat-complete)]"];
  const labels = ["", "Fraca", "Média", "Forte"];
  if (!senha) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${i < score ? colors[score] : "bg-muted"}`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Força: <span className={score === 3 ? "text-[color:var(--color-cat-complete)] font-medium" : score === 2 ? "text-[color:var(--color-terracotta-soft)] font-medium" : "text-[color:var(--color-terracotta-deep)] font-medium"}>{labels[score]}</span>
        {" · "}mínimo 8 caracteres, uma maiúscula e um número ou símbolo.
      </p>
    </div>
  );
}

function Cadastro() {
  const navigate = useNavigate();
  const loginAs = useAppStore((s) => s.loginAs);
  const { redirect } = Route.useSearch();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [termos, setTermos] = useState(false);
  const [lgpd, setLgpd] = useState(false);
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  function clearError(key: string) {
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!nome.trim() || nome.trim().split(" ").filter(Boolean).length < 2)
      e.nome = "Informe seu nome completo (nome e sobrenome).";
    if (!email.includes("@") || !email.includes("."))
      e.email = "Informe um e-mail válido.";
    if (senha.length < 8)
      e.senha = "A senha deve ter pelo menos 8 caracteres.";
    else if (!/[A-Z]/.test(senha))
      e.senha = "Use ao menos uma letra maiúscula.";
    else if (!/[0-9!@#$%^&*]/.test(senha))
      e.senha = "Use ao menos um número ou símbolo especial.";
    if (confirmar !== senha)
      e.confirmar = "As senhas não coincidem.";
    if (!termos)
      e.termos = "Você precisa aceitar os Termos de Uso para continuar.";
    if (!lgpd)
      e.lgpd = "Você precisa aceitar os termos de privacidade (LGPD) para continuar.";
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
      loginAs("u1");
      toast.success("Conta criada! Bem-vindo ao ClassicosBR.");
      setRedirecting(true);
      setTimeout(() => {
        if (redirect && redirect.startsWith("/")) {
          navigate({ to: redirect });
        } else {
          navigate({ to: "/" });
        }
      }, 600);
    }, 800);
  }

  const senhaMatch = confirmar.length > 0 && confirmar === senha;

  if (redirecting) {
    return (
      <div className="min-h-screen bg-[color:var(--color-surface-cream)]">
        <Header />
        <PostAuthSkeleton
          redirect={redirect}
          title="Criando sua conta…"
          subtitle="Preparando sua área."
        />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-surface-cream)]">
      <Header />
      <main id="main-content" className="mx-auto flex max-w-md flex-col px-6 py-14">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-full bg-[color:var(--color-terracotta-soft)]/10 flex items-center justify-center shrink-0">
            <UserPlus className="h-5 w-5 text-[color:var(--color-terracotta-soft)]" />
          </div>
          <div>
            <h1 className="font-serif text-3xl text-foreground">Criar conta</h1>
            <p className="text-sm text-muted-foreground">Junte-se à comunidade ClassicosBR</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-[12px] border border-[color:var(--color-border-cream)] bg-white p-6 shadow-sm">
          {/* Nome completo */}
          <div>
            <Label className="mb-1.5 block text-sm font-medium">Nome completo</Label>
            <Input
              value={nome}
              onChange={(e) => { setNome(e.target.value); clearError("nome"); }}
              placeholder="João da Silva"
              autoComplete="name"
              className={errors.nome ? "border-[color:var(--color-terracotta-deep)] focus-visible:ring-[color:var(--color-terracotta-deep)]/20" : ""}
            />
            {errors.nome && <p className="mt-1 text-xs text-[color:var(--color-terracotta-deep)]">{errors.nome}</p>}
          </div>

          {/* E-mail */}
          <div>
            <Label className="mb-1.5 block text-sm font-medium">E-mail</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
              placeholder="voce@email.com"
              autoComplete="email"
              className={errors.email ? "border-[color:var(--color-terracotta-deep)] focus-visible:ring-[color:var(--color-terracotta-deep)]/20" : ""}
            />
            {errors.email && <p className="mt-1 text-xs text-[color:var(--color-terracotta-deep)]">{errors.email}</p>}
          </div>

          {/* Senha */}
          <div>
            <Label className="mb-1.5 block text-sm font-medium">Senha</Label>
            <div className="relative">
              <Input
                type={showSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => { setSenha(e.target.value); clearError("senha"); }}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                className={`pr-10 ${errors.senha ? "border-[color:var(--color-terracotta-deep)] focus-visible:ring-[color:var(--color-terracotta-deep)]/20" : ""}`}
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
            {errors.senha && <p className="mt-1 text-xs text-[color:var(--color-terracotta-deep)]">{errors.senha}</p>}
            <PasswordStrength senha={senha} />
          </div>

          {/* Confirmar senha */}
          <div>
            <Label className="mb-1.5 block text-sm font-medium">Confirmar senha</Label>
            <div className="relative">
              <Input
                type={showConfirmar ? "text" : "password"}
                value={confirmar}
                onChange={(e) => { setConfirmar(e.target.value); clearError("confirmar"); }}
                placeholder="Repita a senha"
                autoComplete="new-password"
                className={`pr-10 ${errors.confirmar ? "border-[color:var(--color-terracotta-deep)] focus-visible:ring-[color:var(--color-terracotta-deep)]/20" : senhaMatch ? "border-[color:var(--color-cat-complete)] focus-visible:ring-[color:var(--color-cat-complete)]/20" : ""}`}
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirmar((v) => !v)}
              >
                {showConfirmar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmar && <p className="mt-1 text-xs text-[color:var(--color-terracotta-deep)]">{errors.confirmar}</p>}
            {!errors.confirmar && senhaMatch && (
              <p className="mt-1 text-xs text-[color:var(--color-cat-complete)] font-medium">✓ As senhas coincidem</p>
            )}
          </div>

          {/* Termos e LGPD */}
          <div className="space-y-4 rounded-[8px] border border-[color:var(--color-border-cream)] bg-[color:var(--color-surface-cream)] p-4">
            {/* Termos de uso */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termos}
                  onChange={(e) => { setTermos(e.target.checked); clearError("termos"); }}
                  className="mt-0.5 h-4 w-4 rounded border-[color:var(--color-border-cream)] accent-[color:var(--color-terracotta-soft)] cursor-pointer"
                />
                <span className="text-sm leading-relaxed">
                  Li e aceito os{" "}
                  <a href="#" className="text-[color:var(--color-terracotta-soft)] underline hover:opacity-80 font-medium">
                    Termos de Uso
                  </a>{" "}
                  da plataforma ClassicosBR.{" "}
                  <span className="text-[color:var(--color-terracotta-deep)] font-medium">*</span>
                </span>
              </label>
              {errors.termos && <p className="mt-1.5 ml-7 text-xs text-[color:var(--color-terracotta-deep)]">{errors.termos}</p>}
            </div>

            {/* LGPD */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lgpd}
                  onChange={(e) => { setLgpd(e.target.checked); clearError("lgpd"); }}
                  className="mt-0.5 h-4 w-4 rounded border-[color:var(--color-border-cream)] accent-[color:var(--color-terracotta-soft)] cursor-pointer"
                />
                <span className="text-sm leading-relaxed text-muted-foreground">
                  Estou ciente de que os metadados de localização das fotos e o IP de acesso serão
                  registrados exclusivamente para verificação de autenticidade dos anúncios, conforme
                  nossa{" "}
                  <a href="#" className="text-[color:var(--color-cat-todo)] underline hover:opacity-80">
                    Política de Privacidade
                  </a>
                  .{" "}
                  <span className="text-[color:var(--color-terracotta-deep)] font-medium">*</span>
                </span>
              </label>
              {errors.lgpd && <p className="mt-1.5 ml-7 text-xs text-[color:var(--color-terracotta-deep)]">{errors.lgpd}</p>}
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[color:var(--color-terracotta-soft)] hover:bg-[color:var(--color-terracotta-deep)] text-white font-medium h-10"
          >
            {loading ? "Criando conta…" : "Criar conta grátis"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link to="/login" className="text-[color:var(--color-terracotta-soft)] underline hover:opacity-80 font-medium">
            Entrar
          </Link>
        </p>
      </main>
      <Footer />
    </div>
  );
}

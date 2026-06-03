import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/esqueci-senha")({ component: EsqueciSenha });

function EsqueciSenha() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setEmailError("Informe seu e-mail.");
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      setEmailError("Por favor, informe um e-mail válido.");
      return;
    }
    setEmailError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 900);
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-surface-cream)]">
      <Header />
      <main id="main-content" className="mx-auto flex max-w-md flex-col px-6 py-14">
        <Link
          to="/login"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao login
        </Link>

        <div className="rounded-[12px] border border-[color:var(--color-border-cream)] bg-white p-8 shadow-sm">
          {!sent ? (
            <>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--color-terracotta-soft)]/10">
                <KeyRound className="h-6 w-6 text-[color:var(--color-terracotta-soft)]" />
              </div>
              <h1 className="font-serif text-2xl text-foreground">Esqueci minha senha</h1>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Informe o e-mail cadastrado e enviaremos um link para você criar uma nova senha.
                O link expira em <strong>30 minutos</strong>.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <Label className="mb-1.5 block text-sm font-medium">E-mail</Label>
                  <div className="relative">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                      placeholder="voce@email.com"
                      autoFocus
                      autoComplete="email"
                      className={`pl-9 ${emailError ? "border-[color:var(--color-terracotta-deep)] focus-visible:ring-[color:var(--color-terracotta-deep)]/20" : ""}`}
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                  {emailError && <p className="mt-1 text-xs text-[color:var(--color-terracotta-deep)]">{emailError}</p>}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[color:var(--color-terracotta-soft)] hover:bg-[color:var(--color-terracotta-deep)] text-white font-medium h-10"
                >
                  {loading ? "Enviando…" : "Enviar link de recuperação"}
                </Button>
              </form>

              <div className="mt-6 rounded-[8px] bg-[color:var(--color-surface-cream)] border border-[color:var(--color-border-cream)] p-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong>Não recebeu?</strong> Verifique a pasta de spam. O e-mail é enviado de{" "}
                  <span className="font-mono text-foreground/70">noreply@classicosbr.com</span>
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--color-cat-complete)]/10">
                <CheckCircle2 className="h-8 w-8 text-[color:var(--color-cat-complete)]" />
              </div>
              <h2 className="font-serif text-2xl text-foreground">Link enviado!</h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Enviamos um link de recuperação para{" "}
                <span className="font-medium text-foreground">{email}</span>.
                <br />
                Verifique sua caixa de entrada (e o spam, se necessário).
              </p>
              <p className="mt-4 text-xs text-muted-foreground">
                O link expira em <strong>30 minutos</strong>.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="mt-6 text-sm text-[color:var(--color-terracotta-soft)] underline hover:opacity-80"
              >
                Usar outro e-mail
              </button>
            </div>
          )}

          <div className="mt-6 border-t border-[color:var(--color-border-cream)] pt-5 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Lembrou a senha?{" "}
              <Link to="/login" className="text-[color:var(--color-terracotta-soft)] underline hover:opacity-80 font-medium">
                Entrar
              </Link>
            </span>
            <span>
              Sem conta?{" "}
              <Link to="/cadastro" className="text-[color:var(--color-terracotta-soft)] underline hover:opacity-80 font-medium">
                Criar conta
              </Link>
            </span>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

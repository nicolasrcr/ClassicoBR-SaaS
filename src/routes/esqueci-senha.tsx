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
    <div className="min-h-screen bg-[#FAF9F6]">
      <Header />
      <main className="mx-auto flex max-w-md flex-col px-6 py-14">
        <Link
          to="/login"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao login
        </Link>

        <div className="rounded-[12px] border border-[#E8E6E0] bg-white p-8 shadow-sm">
          {!sent ? (
            <>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#B85A30]/10">
                <KeyRound className="h-6 w-6 text-[#B85A30]" />
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
                      className={`pl-9 ${emailError ? "border-[#993C1D] focus-visible:ring-[#993C1D]/20" : ""}`}
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                  {emailError && <p className="mt-1 text-xs text-[#993C1D]">{emailError}</p>}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#B85A30] hover:bg-[#993C1D] text-white font-medium h-10"
                >
                  {loading ? "Enviando…" : "Enviar link de recuperação"}
                </Button>
              </form>

              <div className="mt-6 rounded-[8px] bg-[#FAF9F6] border border-[#E8E6E0] p-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong>Não recebeu?</strong> Verifique a pasta de spam. O e-mail é enviado de{" "}
                  <span className="font-mono text-foreground/70">noreply@classicosbr.com</span>
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#1D6E4E]/10">
                <CheckCircle2 className="h-8 w-8 text-[#1D6E4E]" />
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
                className="mt-6 text-sm text-[#B85A30] underline hover:opacity-80"
              >
                Usar outro e-mail
              </button>
            </div>
          )}

          <div className="mt-6 border-t border-[#E8E6E0] pt-5 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Lembrou a senha?{" "}
              <Link to="/login" className="text-[#B85A30] underline hover:opacity-80 font-medium">
                Entrar
              </Link>
            </span>
            <span>
              Sem conta?{" "}
              <Link to="/cadastro" className="text-[#B85A30] underline hover:opacity-80 font-medium">
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

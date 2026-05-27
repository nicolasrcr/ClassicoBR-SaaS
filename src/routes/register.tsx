import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/register")({ component: Register });

function Register() {
  const navigate = useNavigate();
  const login = useAppStore((s) => s.login);
  const [form, setForm] = useState({ name: "", email: "", pw: "", pw2: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.pw !== form.pw2) {
      toast.error("As senhas não coincidem");
      return;
    }
    login(false);
    toast.success("Conta criada");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto flex max-w-md flex-col px-6 py-16">
        <h1 className="font-serif text-3xl">Criar conta</h1>
        <p className="mt-2 text-sm text-muted-foreground">É grátis e leva menos de um minuto.</p>
        <form onSubmit={submit} className="mt-8 space-y-4 rounded-[10px] border border-border bg-card p-6">
          {[
            ["Nome completo", "name", "text"],
            ["E-mail", "email", "email"],
            ["Senha", "pw", "password"],
            ["Confirmar senha", "pw2", "password"],
          ].map(([l, k, t]) => (
            <div key={k}>
              <Label className="mb-1.5 block">{l}</Label>
              <Input type={t} required value={form[k as keyof typeof form]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
            </div>
          ))}
          <Button type="submit" className="w-full bg-[color:var(--color-terracotta)] text-white hover:bg-[color:var(--color-terracotta-dark)]">Criar conta</Button>
          <p className="pt-2 text-center text-xs text-muted-foreground">
            Já tem conta? <Link to="/login" className="underline">Entrar</Link>
          </p>
        </form>
      </main>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettingsStore } from "@/store/settings-store";

export const Route = createFileRoute("/admin/config")({ component: Config });

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[10px] border border-border bg-card p-6">
      <h2 className="font-serif text-xl">{title}</h2>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4 last:border-0 last:pb-0">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Config() {
  const settings = useSettingsStore();
  const [s, setS] = useState({
    siteName: "ClassicosBR",
    tagline: "Marketplace de carros clássicos",
    email: "contato@classicosbr.com",
    listingDays: "60",
    allowNoPrice: true,
    google: true,
    notifyListing: true,
    notifyUser: false,
    notifyReport: true,
  });
  const upd = <K extends keyof typeof s>(k: K, v: (typeof s)[K]) => setS((p) => ({ ...p, [k]: v }));

  return (
    <div className="relative space-y-6 p-6 pb-28 md:p-10">
      <header>
        <h1 className="font-serif text-3xl">Configurações do site</h1>
      </header>

      <Section title="Geral">
        <Row label="Nome do site"><Input className="w-64" value={s.siteName} onChange={(e) => upd("siteName", e.target.value)} /></Row>
        <Row label="Tagline"><Input className="w-64" value={s.tagline} onChange={(e) => upd("tagline", e.target.value)} /></Row>
        <Row label="E-mail de contato"><Input className="w-64" value={s.email} onChange={(e) => upd("email", e.target.value)} /></Row>
        <Row label="Modo manutenção" hint="Tira o site do ar para usuários comuns">
          <Switch checked={settings.manutencao} onCheckedChange={() => settings.toggle("manutencao")} />
        </Row>
      </Section>

      <Section title="Anúncios">
        <Row label="Limite de fotos por anúncio" hint="Limite fixo reforçado no componente de upload">
          <span className="inline-flex h-9 w-24 items-center justify-center rounded-md border border-border bg-muted px-3 text-sm text-muted-foreground">5 (fixo)</span>
        </Row>
        <Row label="Aprovação manual de anúncios" hint="Novos anúncios entram como 'Pendente'">
          <Switch checked={settings.aprovacaoManualAnuncios} onCheckedChange={() => settings.toggle("aprovacaoManualAnuncios")} />
        </Row>
        <Row label="Tempo máximo de um anúncio ativo">
          <Select value={s.listingDays} onValueChange={(v) => upd("listingDays", v)}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="60">60 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row label="Permitir anúncios sem preço">
          <Switch checked={s.allowNoPrice} onCheckedChange={(v) => upd("allowNoPrice", v)} />
        </Row>
      </Section>

      <Section title="Usuários">
        <Row label="Aprovação manual de cadastro" hint="Quando OFF, novos cadastros são aprovados automaticamente">
          <Switch checked={settings.aprovacaoManualCadastros} onCheckedChange={() => settings.toggle("aprovacaoManualCadastros")} />
        </Row>
        <Row label="Permitir login com Google">
          <Switch checked={s.google} onCheckedChange={(v) => upd("google", v)} />
        </Row>
      </Section>

      <Section title="Notificações por e-mail">
        <Label className="flex items-center gap-2"><Checkbox checked={s.notifyListing} onCheckedChange={(v) => upd("notifyListing", !!v)} /> Novo anúncio</Label>
        <Label className="flex items-center gap-2"><Checkbox checked={s.notifyUser} onCheckedChange={(v) => upd("notifyUser", !!v)} /> Novo usuário</Label>
        <Label className="flex items-center gap-2"><Checkbox checked={s.notifyReport} onCheckedChange={(v) => upd("notifyReport", !!v)} /> Nova denúncia</Label>
      </Section>

      <div className="sticky bottom-4 z-20 flex justify-end">
        <Button className="bg-[color:var(--color-terracotta)] text-white shadow-lg hover:bg-[color:var(--color-terracotta-dark)]"
          onClick={() => toast.success("Configurações salvas")}>
          Salvar configurações
        </Button>
      </div>
    </div>
  );
}

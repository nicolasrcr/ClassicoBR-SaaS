import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettingsStore } from "@/store/settings-store";

export const Route = createFileRoute("/admin/configuracoes")({ component: AdminConfiguracoes });

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

function AdminConfiguracoes() {
  const s = useSettingsStore();

  return (
    <div className="relative space-y-6 p-6 pb-28 md:p-10">
      <header>
        <h1 className="font-serif text-3xl">Configurações do site</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gerencie as configurações gerais da plataforma</p>
      </header>

      {/* GERAL */}
      <Section title="Geral">
        <Row label="Nome do site">
          <Input
            className="w-64"
            value={s.nomeSite}
            onChange={(e) => s.update({ nomeSite: e.target.value })}
          />
        </Row>
        <Row label="Tagline">
          <Input
            className="w-64"
            value={s.tagline}
            onChange={(e) => s.update({ tagline: e.target.value })}
          />
        </Row>
        <Row label="E-mail de contato">
          <Input
            className="w-64"
            type="email"
            value={s.emailContato}
            onChange={(e) => s.update({ emailContato: e.target.value })}
          />
        </Row>
        <Row label="Modo manutenção" hint="Tira o site do ar para usuários comuns">
          <Switch
            checked={s.modoManutencao}
            onCheckedChange={() => s.toggle("modoManutencao")}
          />
        </Row>
      </Section>

      {/* ANÚNCIOS */}
      <Section title="Anúncios">
        <Row label="Aprovação manual de anúncios" hint="Novos anúncios entram como 'Pendente'">
          <Switch
            checked={s.aprovacaoManualAnuncios}
            onCheckedChange={() => s.toggle("aprovacaoManualAnuncios")}
          />
        </Row>
        <Row label="Tempo máximo de um anúncio ativo">
          <Select
            value={String(s.prazoMaximoAtivo)}
            onValueChange={(v) => s.update({ prazoMaximoAtivo: parseInt(v) as 30 | 60 | 90 })}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="60">60 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row label="Permitir anúncios sem preço (preço oculto)">
          <Switch
            checked={s.permitirPrecoOculto}
            onCheckedChange={() => s.toggle("permitirPrecoOculto")}
          />
        </Row>
        <Row label="Limite de fotos por anúncio" hint="Limite fixo reforçado no componente de upload">
          <span className="inline-flex h-9 w-24 items-center justify-center rounded-md border border-border bg-muted px-3 text-sm text-muted-foreground">
            5 (fixo)
          </span>
        </Row>
      </Section>

      {/* USUÁRIOS */}
      <Section title="Usuários">
        <Row label="Aprovação manual de cadastro" hint="Quando OFF, novos cadastros são aprovados automaticamente">
          <Switch
            checked={s.aprovacaoManualCadastros}
            onCheckedChange={() => s.toggle("aprovacaoManualCadastros")}
          />
        </Row>
        <Row label="Permitir login com Google">
          <Switch
            checked={s.loginGoogle}
            onCheckedChange={() => s.toggle("loginGoogle")}
          />
        </Row>
      </Section>

      {/* NOTIFICAÇÕES */}
      <Section title="Notificações por e-mail">
        <div className="space-y-3">
          <Label className="flex cursor-pointer items-center gap-3">
            <Checkbox
              checked={s.notifNovoAnuncio}
              onCheckedChange={() => s.toggle("notifNovoAnuncio")}
            />
            <span className="text-sm font-normal">Notificar por e-mail quando houver novo anúncio</span>
          </Label>
          <Label className="flex cursor-pointer items-center gap-3">
            <Checkbox
              checked={s.notifNovoUsuario}
              onCheckedChange={() => s.toggle("notifNovoUsuario")}
            />
            <span className="text-sm font-normal">Notificar por e-mail quando houver novo usuário</span>
          </Label>
          <Label className="flex cursor-pointer items-center gap-3">
            <Checkbox
              checked={s.notifNovaDenuncia}
              onCheckedChange={() => s.toggle("notifNovaDenuncia")}
            />
            <span className="text-sm font-normal">Notificar por e-mail quando houver nova denúncia</span>
          </Label>
        </div>
      </Section>

      {/* Salvar fixo no rodapé */}
      <div className="fixed bottom-0 left-64 right-0 border-t border-border bg-background/95 px-10 py-4 backdrop-blur">
        <div className="flex justify-end">
          <Button
            className="bg-[color:var(--color-terracotta)] text-white shadow hover:bg-[color:var(--color-terracotta-dark)]"
            onClick={() => toast.success("Configurações salvas com sucesso")}
          >
            Salvar configurações
          </Button>
        </div>
      </div>
    </div>
  );
}

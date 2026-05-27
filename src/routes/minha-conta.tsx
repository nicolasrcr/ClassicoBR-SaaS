import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Pencil, Pause, Play, Trash2, Upload, Shield, Star, CreditCard,
  Monitor, Smartphone, Globe, Check, X, ChevronRight,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScoreBadge } from "@/components/ScoreBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useAppStore, useCurrentUser } from "@/store/app-store";
import { mockPayments } from "@/lib/mock-data";
import { formatDate, formatPrice } from "@/lib/format";
import type { Listing } from "@/lib/types";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/types";

export const Route = createFileRoute("/minha-conta")({ component: MinhaConta });

// ─── helpers ───────────────────────────────────────────────────────────────
function validaCPF(cpf: string) {
  const n = cpf.replace(/\D/g, "");
  if (n.length !== 11 || /^(\d)\1+$/.test(n)) return false;
  let s = 0;
  for (let i = 0; i < 9; i++) s += +n[i] * (10 - i);
  let r = 11 - (s % 11);
  if (r >= 10) r = 0;
  if (r !== +n[9]) return false;
  s = 0;
  for (let i = 0; i < 10; i++) s += +n[i] * (11 - i);
  r = 11 - (s % 11);
  if (r >= 10) r = 0;
  return r === +n[10];
}

// status badge color
function statusColor(status: string) {
  if (status === "ativo") return "bg-[#1D6E4E]/10 text-[#1D6E4E]";
  if (status === "pausado") return "bg-amber-100 text-amber-700";
  if (status === "pendente") return "bg-[#185FA5]/10 text-[#185FA5]";
  return "bg-muted text-muted-foreground";
}

// ─── Aba 1 – Modal de edição de anúncio ─────────────────────────────────────
function EditListingModal({ listing, onClose }: { listing: Listing; onClose: () => void }) {
  const { updateListing } = useAppStore();
  const [title, setTitle] = useState(listing.title);
  const [price, setPrice] = useState(listing.price?.toString() ?? "");
  const [description, setDescription] = useState(listing.description);

  function save() {
    updateListing(listing.id, {
      title,
      price: price ? Number(price) : null,
      description,
    });
    toast.success("Anúncio atualizado!");
    onClose();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Editar anúncio</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="mb-1.5 block text-sm">Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Preço (R$)</Label>
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Deixe vazio para 'a consultar'" />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Descrição</Label>
            <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={save} className="bg-[#B85A30] hover:bg-[#993C1D] text-white">Salvar alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Aba 1 – Meus anúncios ──────────────────────────────────────────────────
function AbaAnuncios({ myListings }: { myListings: Listing[] }) {
  const { updateListing, removeListing } = useAppStore();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editListing, setEditListing] = useState<Listing | null>(null);

  // Mock views
  const mockViews: Record<string, number> = { l1: 142, l2: 87, l3: 54, l4: 210, l5: 36, l6: 198 };

  return (
    <div className="mt-6">
      {myListings.length === 0 ? (
        <div className="text-center py-16 rounded-[12px] border border-dashed border-border">
          <p className="font-serif text-lg text-muted-foreground mb-2">Nenhum anúncio ainda</p>
          <p className="text-sm text-muted-foreground mb-6">Publique seu primeiro clássico e alcance colecionadores em todo o Brasil.</p>
          <Button asChild className="bg-[#B85A30] hover:bg-[#993C1D] text-white">
            <Link to="/criar">Anunciar meu clássico</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">{myListings.length} anúncio{myListings.length !== 1 ? "s" : ""}</p>
            <Button asChild size="sm" className="bg-[#B85A30] hover:bg-[#993C1D] text-white">
              <Link to="/criar">+ Novo anúncio</Link>
            </Button>
          </div>
          <div className="overflow-x-auto rounded-[10px] border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-[#FAF9F6]">
                  <th className="text-left p-3 font-medium text-muted-foreground">Veículo</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">Condição</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Score</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">Visualizações</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {myListings.map((l) => (
                  <tr key={l.id} className="bg-card hover:bg-[#FAF9F6]/60 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {l.photos[0] && (
                          <img
                            src={l.photos[0]}
                            alt={l.title}
                            className="h-10 w-14 rounded-[6px] object-cover shrink-0 hidden xs:block"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-serif text-sm font-medium truncate max-w-[180px]">{l.title}</p>
                          <p className="text-xs text-muted-foreground">{formatPrice(l.price)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 hidden sm:table-cell">
                      <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                        style={{ backgroundColor: CATEGORY_COLORS[l.category] }}
                      >
                        {CATEGORY_LABELS[l.category]}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${statusColor(l.status)}`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <ScoreBadge score={l.scoreConfianca} />
                    </td>
                    <td className="p-3 hidden lg:table-cell text-muted-foreground">
                      {mockViews[l.id] ?? Math.floor(Math.random() * 200 + 10)}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Editar"
                          onClick={() => setEditListing(l)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-amber-600 hover:text-amber-700"
                          title={l.status === "ativo" ? "Pausar" : "Reativar"}
                          onClick={() => {
                            updateListing(l.id, { status: l.status === "ativo" ? "pausado" : "ativo" });
                            toast.success(l.status === "ativo" ? "Anúncio pausado" : "Anúncio reativado");
                          }}
                        >
                          {l.status === "ativo" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          title="Remover"
                          onClick={() => setDeleteId(l.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Edit modal */}
      {editListing && <EditListingModal listing={editListing} onClose={() => setEditListing(null)} />}

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover anúncio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O anúncio será permanentemente removido da plataforma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) {
                  removeListing(deleteId);
                  toast.success("Anúncio removido");
                  setDeleteId(null);
                }
              }}
            >
              Sim, remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Aba 4 – Dados pessoais ─────────────────────────────────────────────────
function AbaDados() {
  const user = useCurrentUser()!;
  const { updateUser } = useAppStore();

  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [city, setCity] = useState(user.city);
  const [state, setState] = useState(user.state);
  const [bio, setBio] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [cpfVal, setCpfVal] = useState("");
  const [cpfError, setCpfError] = useState("");
  const [kycStatus, setKycStatus] = useState<"idle" | "pending">("idle");

  const verLevel = [
    user.verificacoes.email,
    user.verificacoes.telefone,
    user.verificacoes.cpf,
    user.verificacoes.kyc,
  ].filter(Boolean).length;
  const verPct = (verLevel / 4) * 100;

  function saveData() {
    updateUser(user.id, { name, phone, city, state });
    toast.success("Dados salvos com sucesso!");
  }

  return (
    <div className="mt-6 space-y-8">
      {/* Formulário */}
      <div className="rounded-[12px] border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-[#B85A30]/10 font-serif text-2xl text-[#B85A30]">
                {user.name[0]}
              </AvatarFallback>
            </Avatar>
            <button
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#B85A30] text-white shadow hover:bg-[#993C1D] transition-colors"
              onClick={() => toast.info("Upload de avatar em breve!")}
            >
              <Upload className="h-3.5 w-3.5" />
            </button>
          </div>
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Membro desde {formatDate(user.memberSince)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 block text-sm">Nome completo</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Telefone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Cidade</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Estado</Label>
            <Input value={state} onChange={(e) => setState(e.target.value)} maxLength={2} placeholder="SP" />
          </div>
        </div>

        <div>
          <Label className="mb-1.5 block text-sm">Bio</Label>
          <Textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Fale um pouco sobre você e sua paixão por clássicos…"
          />
        </div>

        <Button onClick={saveData} className="bg-[#B85A30] hover:bg-[#993C1D] text-white">
          Salvar dados
        </Button>
      </div>

      {/* Verificações */}
      <div>
        <h2 className="font-serif text-xl mb-4">Verificações progressivas</h2>
        <div className="mb-5">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Nível {verLevel} de 4</span>
            <span>{Math.round(verPct)}% concluído</span>
          </div>
          <Progress value={verPct} className="h-2" />
        </div>

        <div className="space-y-3">
          {/* Nível 1 — Email */}
          <div className="flex items-start gap-4 rounded-[10px] border border-border bg-card p-4">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${user.verificacoes.email ? "bg-[#1D6E4E]/10 text-[#1D6E4E]" : "bg-muted text-muted-foreground"}`}>
              {user.verificacoes.email ? <Check className="h-4 w-4" /> : "1"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-sm">Nível 1 — E-mail</p>
                {user.verificacoes.email
                  ? <span className="text-xs text-[#1D6E4E] font-medium">Verificado ✅</span>
                  : <span className="text-xs text-amber-600">Pendente</span>}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Necessário para visualizar contatos dos vendedores</p>
            </div>
            {!user.verificacoes.email && (
              <Button size="sm" variant="outline" onClick={() => {
                updateUser(user.id, { verificacoes: { ...user.verificacoes, email: true } });
                toast.success("E-mail verificado!");
              }}>
                Verificar agora
              </Button>
            )}
          </div>

          {/* Nível 2 — Telefone */}
          <div className="rounded-[10px] border border-border bg-card p-4">
            <div className="flex items-start gap-4">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${user.verificacoes.telefone ? "bg-[#1D6E4E]/10 text-[#1D6E4E]" : "bg-muted text-muted-foreground"}`}>
                {user.verificacoes.telefone ? <Check className="h-4 w-4" /> : "2"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-sm">Nível 2 — Telefone</p>
                  {user.verificacoes.telefone
                    ? <span className="text-xs text-[#1D6E4E] font-medium">Verificado ✅</span>
                    : <span className="text-xs text-amber-600">Pendente</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Libera publicação de anúncios
                </p>
              </div>
            </div>
            {!user.verificacoes.telefone && (
              <div className="mt-3 ml-12">
                <p className="text-xs text-muted-foreground mb-2">Insira o código de 6 dígitos enviado por SMS:</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="000000"
                    maxLength={6}
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ""))}
                    className="max-w-[140px] font-mono tracking-widest"
                  />
                  <Button size="sm" onClick={() => {
                    if (smsCode.length === 6) {
                      updateUser(user.id, { verificacoes: { ...user.verificacoes, telefone: true } });
                      toast.success("Telefone verificado! Agora você pode publicar anúncios.");
                      setSmsCode("");
                    } else {
                      toast.error("Digite os 6 dígitos do código SMS.");
                    }
                  }}>Confirmar</Button>
                </div>
                <button className="mt-2 text-xs text-[#185FA5] hover:underline" onClick={() => toast.info("Código reenviado!")}>
                  Reenviar código
                </button>
              </div>
            )}
          </div>

          {/* Nível 3 — CPF */}
          <div className="rounded-[10px] border border-border bg-card p-4">
            <div className="flex items-start gap-4">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${user.verificacoes.cpf ? "bg-[#1D6E4E]/10 text-[#1D6E4E]" : "bg-muted text-muted-foreground"}`}>
                {user.verificacoes.cpf ? <Check className="h-4 w-4" /> : "3"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-sm">Nível 3 — CPF</p>
                  {user.verificacoes.cpf
                    ? <span className="text-xs text-[#1D6E4E] font-medium">Verificado ✅</span>
                    : <span className="text-xs text-amber-600">Pendente</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Libera até 5 anúncios simultâneos (gratuito) ou ilimitados (Premium)
                </p>
              </div>
            </div>
            {!user.verificacoes.cpf && (
              <div className="mt-3 ml-12">
                <p className="text-xs text-muted-foreground mb-2">Seu CPF (apenas dígitos verificadores são validados no front-end):</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="000.000.000-00"
                    value={cpfVal}
                    onChange={(e) => { setCpfVal(e.target.value); setCpfError(""); }}
                    className={`max-w-[180px] ${cpfError ? "border-[#993C1D]" : ""}`}
                  />
                  <Button size="sm" onClick={() => {
                    if (!validaCPF(cpfVal)) {
                      setCpfError("CPF inválido. Verifique os dígitos.");
                      return;
                    }
                    updateUser(user.id, { verificacoes: { ...user.verificacoes, cpf: true } });
                    toast.success("CPF verificado! Você pode publicar até 5 anúncios.");
                  }}>Validar</Button>
                </div>
                {cpfError && <p className="mt-1 text-xs text-[#993C1D]">{cpfError}</p>}
              </div>
            )}
          </div>

          {/* Nível 4 — KYC */}
          <div className="rounded-[10px] border border-border bg-card p-4">
            <div className="flex items-start gap-4">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${user.verificacoes.kyc ? "bg-amber-100 text-amber-600" : "bg-muted text-muted-foreground"}`}>
                {user.verificacoes.kyc ? "🏅" : "4"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-sm">Nível 4 — Identidade (KYC)</p>
                  {user.verificacoes.kyc
                    ? <span className="text-xs text-amber-600 font-medium">Confirmado 🏅</span>
                    : kycStatus === "pending"
                    ? <span className="text-xs text-[#185FA5] font-medium">Em revisão…</span>
                    : <span className="text-xs text-amber-600">Pendente</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Badge dourado 🏅 + anúncios em destaque gratuitos
                </p>
              </div>
            </div>
            {!user.verificacoes.kyc && kycStatus === "idle" && (
              <div className="mt-3 ml-12 space-y-3">
                <p className="text-xs text-muted-foreground">Envie os documentos para revisão manual (até 48h úteis):</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {["RG/CNH — frente", "RG/CNH — verso", "Selfie segurando o doc"].map((label) => (
                    <button
                      key={label}
                      onClick={() => toast.info(`Seleção de arquivo: ${label} (demo)`)}
                      className="flex items-center gap-2 rounded-[8px] border border-dashed border-border p-3 text-xs text-muted-foreground hover:border-foreground/30 hover:bg-[#FAF9F6] transition-colors"
                    >
                      <Upload className="h-3.5 w-3.5 shrink-0" />
                      {label}
                    </button>
                  ))}
                </div>
                <Button
                  size="sm"
                  className="bg-[#B85A30] hover:bg-[#993C1D] text-white"
                  onClick={() => { setKycStatus("pending"); toast.success("Documentos enviados! Revisão em até 48h."); }}
                >
                  Enviar para revisão
                </Button>
              </div>
            )}
            {!user.verificacoes.kyc && kycStatus === "pending" && (
              <div className="mt-3 ml-12 rounded-[8px] bg-[#185FA5]/5 border border-[#185FA5]/20 p-3">
                <p className="text-xs text-[#185FA5]">
                  Seus documentos estão sendo analisados pela nossa equipe. Você será notificado por e-mail em até 48 horas úteis.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Aba 5 – Segurança ──────────────────────────────────────────────────────
function AbaSeguranca() {
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passErrors, setPassErrors] = useState<Record<string, string>>({});

  const sessions = [
    { icon: Monitor, device: "Chrome / Windows 11", city: "São Paulo, SP", date: "Agora", current: true },
    { icon: Smartphone, device: "Safari / iPhone 15", city: "São Paulo, SP", date: "Ontem, 18:42", current: false },
    { icon: Globe, device: "Firefox / Ubuntu", city: "Campinas, SP", date: "20/05/2026, 09:15", current: false },
  ];

  function handleChangePass() {
    const e: Record<string, string> = {};
    if (!currentPass) e.current = "Informe a senha atual.";
    if (newPass.length < 8) e.new = "A nova senha deve ter ao menos 8 caracteres.";
    if (confirmPass !== newPass) e.confirm = "As senhas não coincidem.";
    if (Object.keys(e).length) { setPassErrors(e); return; }
    setPassErrors({});
    setCurrentPass(""); setNewPass(""); setConfirmPass("");
    toast.success("Senha alterada com sucesso!");
  }

  return (
    <div className="mt-6 space-y-8">
      {/* Troca de senha */}
      <div className="rounded-[12px] border border-border bg-card p-6">
        <h2 className="font-serif text-xl mb-5 flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#B85A30]" />
          Trocar senha
        </h2>
        <div className="space-y-4 max-w-sm">
          <div>
            <Label className="mb-1.5 block text-sm">Senha atual</Label>
            <Input
              type="password"
              value={currentPass}
              onChange={(e) => { setCurrentPass(e.target.value); setPassErrors((p) => ({ ...p, current: "" })); }}
              className={passErrors.current ? "border-[#993C1D]" : ""}
            />
            {passErrors.current && <p className="mt-1 text-xs text-[#993C1D]">{passErrors.current}</p>}
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Nova senha</Label>
            <Input
              type="password"
              value={newPass}
              onChange={(e) => { setNewPass(e.target.value); setPassErrors((p) => ({ ...p, new: "" })); }}
              placeholder="Mínimo 8 caracteres"
              className={passErrors.new ? "border-[#993C1D]" : ""}
            />
            {passErrors.new && <p className="mt-1 text-xs text-[#993C1D]">{passErrors.new}</p>}
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Confirmar nova senha</Label>
            <Input
              type="password"
              value={confirmPass}
              onChange={(e) => { setConfirmPass(e.target.value); setPassErrors((p) => ({ ...p, confirm: "" })); }}
              className={passErrors.confirm ? "border-[#993C1D]" : ""}
            />
            {passErrors.confirm && <p className="mt-1 text-xs text-[#993C1D]">{passErrors.confirm}</p>}
          </div>
          <Button onClick={handleChangePass} className="bg-[#B85A30] hover:bg-[#993C1D] text-white">
            Alterar senha
          </Button>
        </div>
      </div>

      {/* Sessões ativas */}
      <div className="rounded-[12px] border border-border bg-card p-6">
        <h2 className="font-serif text-xl mb-5">Sessões ativas</h2>
        <div className="space-y-3">
          {sessions.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="flex items-center justify-between rounded-[8px] border border-border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FAF9F6]">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium flex items-center gap-2">
                      {s.device}
                      {s.current && (
                        <span className="text-[10px] font-semibold text-[#1D6E4E] bg-[#1D6E4E]/10 px-1.5 py-0.5 rounded-full">
                          Esta sessão
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{s.city} · {s.date}</p>
                  </div>
                </div>
                {!s.current && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-destructive hover:text-destructive hover:bg-destructive/5"
                    onClick={() => toast.success("Sessão encerrada")}
                  >
                    Encerrar
                  </Button>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Se você não reconhecer alguma sessão, encerre-a imediatamente e troque sua senha.
        </p>
      </div>
    </div>
  );
}

// ─── Aba 6 – Meu plano ──────────────────────────────────────────────────────
function AbaPlano({ myListings }: { myListings: Listing[] }) {
  const user = useCurrentUser()!;
  const myPayments = mockPayments.filter((p) => p.userId === user.id);
  const activeListings = myListings.filter((l) => l.status === "ativo").length;
  const maxListings = user.plan === "premium" ? 20 : 3;

  const planos = [
    {
      name: "Gratuito",
      price: "R$ 0",
      features: [
        { label: "Até 3 anúncios ativos", ok: true },
        { label: "Fotos (até 8 por anúncio)", ok: true },
        { label: "Chat com interessados", ok: true },
        { label: "Dossiê documental", ok: true },
        { label: "Destaque na busca", ok: false },
        { label: "Anúncios ilimitados", ok: false },
        { label: "Suporte prioritário", ok: false },
        { label: "Badge Premium", ok: false },
      ],
    },
    {
      name: "Premium",
      price: "R$ 29,90/mês",
      features: [
        { label: "Até 20 anúncios ativos", ok: true },
        { label: "Fotos (até 20 por anúncio)", ok: true },
        { label: "Chat com interessados", ok: true },
        { label: "Dossiê documental", ok: true },
        { label: "Destaque na busca", ok: true },
        { label: "Anúncios ilimitados (com CPF)", ok: true },
        { label: "Suporte prioritário", ok: true },
        { label: "Badge Premium", ok: true },
      ],
    },
  ];

  return (
    <div className="mt-6 space-y-8">
      {/* Status atual */}
      <div className="rounded-[12px] border-2 border-[#B85A30] bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Badge
              className={user.plan === "premium"
                ? "bg-amber-500 text-white mb-2"
                : "bg-[#B85A30] text-white mb-2"}
            >
              {user.plan === "premium" ? "⭐ Premium" : "Gratuito"}
            </Badge>
            <p className="text-sm text-muted-foreground">
              {activeListings} de {maxListings} anúncios ativos utilizados
            </p>
          </div>
          <CreditCard className="h-8 w-8 text-muted-foreground/40" />
        </div>
        <Progress value={(activeListings / maxListings) * 100} className="h-2" />
        {activeListings >= maxListings && (
          <p className="mt-2 text-xs text-[#993C1D] font-medium">
            Você atingiu o limite de anúncios. Faça upgrade para publicar mais.
          </p>
        )}
      </div>

      {/* Tabela comparativa */}
      <div>
        <h2 className="font-serif text-xl mb-4">Comparar planos</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {planos.map((plano) => (
            <div
              key={plano.name}
              className={`rounded-[12px] border p-5 ${
                plano.name === "Premium"
                  ? "border-amber-400 bg-amber-50/50"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-serif text-lg">{plano.name}</h3>
                {plano.name === "Premium" && (
                  <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                    Recomendado
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-foreground mb-4">{plano.price}</p>
              <ul className="space-y-2">
                {plano.features.map((f) => (
                  <li key={f.label} className="flex items-center gap-2 text-sm">
                    {f.ok
                      ? <Check className="h-4 w-4 text-[#1D6E4E] shrink-0" />
                      : <X className="h-4 w-4 text-muted-foreground/40 shrink-0" />}
                    <span className={f.ok ? "text-foreground" : "text-muted-foreground"}>{f.label}</span>
                  </li>
                ))}
              </ul>
              {plano.name === "Premium" && user.plan !== "premium" && (
                <Button
                  className="mt-5 w-full bg-amber-500 hover:bg-amber-600 text-white font-medium"
                  onClick={() => toast.info("Upgrade de plano em breve!")}
                >
                  Fazer upgrade
                </Button>
              )}
              {plano.name === user.plan && (
                <p className="mt-5 text-center text-xs text-muted-foreground font-medium">
                  ✓ Seu plano atual
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Histórico de pagamentos */}
      {myPayments.length > 0 ? (
        <div>
          <h2 className="font-serif text-xl mb-4">Histórico de pagamentos</h2>
          <div className="rounded-[10px] border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-[#FAF9F6]">
                  <th className="text-left p-3 font-medium text-muted-foreground">Plano</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Data</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Valor</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {myPayments.map((p) => (
                  <tr key={p.id} className="bg-card">
                    <td className="p-3">{p.plan}</td>
                    <td className="p-3 text-muted-foreground">{formatDate(p.date)}</td>
                    <td className="p-3 font-medium">{formatPrice(p.amount)}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          p.status === "pago"
                            ? "bg-[#1D6E4E]/10 text-[#1D6E4E]"
                            : p.status === "falhou"
                            ? "bg-[#993C1D]/10 text-[#993C1D]"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-[10px] border border-border bg-card p-6 text-center">
          <p className="text-muted-foreground text-sm">Nenhum pagamento registrado.</p>
        </div>
      )}
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
function MinhaConta() {
  const user = useCurrentUser();
  const { listings } = useAppStore();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF9F6]">
        <Header />
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="font-serif text-2xl mb-3">Faça login para acessar sua conta</h2>
          <p className="text-muted-foreground mb-6">Você precisa estar logado para visualizar esta página.</p>
          <Button asChild className="bg-[#B85A30] hover:bg-[#993C1D] text-white">
            <Link to="/login">Entrar</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const myListings = listings.filter((l) => l.sellerId === user.id);
  const verLevel = [
    user.verificacoes.email,
    user.verificacoes.telefone,
    user.verificacoes.cpf,
    user.verificacoes.kyc,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Header />

      {/* Banner de alerta */}
      {!user.verificacoes.telefone && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-sm text-amber-800">
          Complete seu perfil para publicar anúncios →{" "}
          <button
            onClick={() => {
              const el = document.querySelector('[data-value="dados"]') as HTMLElement;
              el?.click();
            }}
            className="underline font-medium hover:opacity-80"
          >
            Verificar telefone
          </button>
        </div>
      )}

      <main className="mx-auto max-w-4xl px-6 py-10">
        {/* Profile header */}
        <div className="flex items-center gap-5 mb-8">
          <Avatar className="h-16 w-16 ring-2 ring-[#B85A30]/20">
            <AvatarFallback className="bg-[#B85A30]/10 font-serif text-2xl text-[#B85A30]">
              {user.name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-serif text-2xl truncate">{user.name}</h1>
              {user.verificacoes.kyc && <span title="Identidade confirmada">🏅</span>}
              {user.plan === "premium" && (
                <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">Premium</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Verificação nível {verLevel}/4 · Membro desde {formatDate(user.memberSince)}
            </p>
          </div>
        </div>

        <Tabs defaultValue="anuncios">
          <TabsList className="flex-wrap h-auto gap-1 mb-2">
            <TabsTrigger value="anuncios">Meus anúncios</TabsTrigger>
            <TabsTrigger value="chat">Mensagens</TabsTrigger>
            <TabsTrigger value="favoritos">Favoritos</TabsTrigger>
            <TabsTrigger value="dados" data-value="dados">Dados pessoais</TabsTrigger>
            <TabsTrigger value="seguranca">Segurança</TabsTrigger>
            <TabsTrigger value="plano">Meu plano</TabsTrigger>
          </TabsList>

          {/* Aba 1 — Meus anúncios */}
          <TabsContent value="anuncios">
            <AbaAnuncios myListings={myListings} />
          </TabsContent>

          {/* Aba 2 — Mensagens */}
          <TabsContent value="chat" className="mt-6">
            <div className="rounded-[12px] border border-border bg-card p-10 text-center">
              <p className="font-serif text-lg mb-2">Suas mensagens</p>
              <p className="text-sm text-muted-foreground mb-6">
                Todas as conversas ficam no chat integrado da plataforma.
              </p>
              <Button asChild className="bg-[#B85A30] hover:bg-[#993C1D] text-white">
                <Link to="/chat">
                  Ir para o chat <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </TabsContent>

          {/* Aba 3 — Favoritos */}
          <TabsContent value="favoritos" className="mt-6">
            <div className="rounded-[12px] border border-border bg-card p-10 text-center">
              <p className="font-serif text-lg mb-2">Seus favoritos</p>
              <p className="text-sm text-muted-foreground mb-6">
                Guarde os clássicos que chamaram sua atenção e compare quando quiser.
              </p>
              <Button asChild className="bg-[#B85A30] hover:bg-[#993C1D] text-white">
                <Link to="/favoritos">
                  Ver meus favoritos <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </TabsContent>

          {/* Aba 4 — Dados pessoais */}
          <TabsContent value="dados">
            <AbaDados />
          </TabsContent>

          {/* Aba 5 — Segurança */}
          <TabsContent value="seguranca">
            <AbaSeguranca />
          </TabsContent>

          {/* Aba 6 — Meu plano */}
          <TabsContent value="plano">
            <AbaPlano myListings={myListings} />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}

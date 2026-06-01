import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Props = {
  /** Tipo do conteúdo: "evento", "serviço", "artigo" */
  kind: string;
  /** Título do conteúdo (ex.: nome do evento) */
  contextTitle: string;
  /** Nome do destinatário (organizador, anunciante, autor) */
  recipientName?: string;
  /** WhatsApp direto opcional (substitui formulário com link rápido) */
  whatsapp?: string;
  /** Rótulo do botão. Default: "Tenho interesse" */
  triggerLabel?: string;
  /** Variante visual do botão gatilho */
  variant?: "primary" | "outline";
  className?: string;
};

export function ContactLeadDialog({
  kind,
  contextTitle,
  recipientName,
  whatsapp,
  triggerLabel = "Tenho interesse",
  variant = "primary",
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [contato, setContato] = useState("");
  const [mensagem, setMensagem] = useState(
    `Olá! Tenho interesse neste ${kind}: "${contextTitle}". Pode me passar mais informações?`,
  );

  const baseBtn =
    variant === "primary"
      ? "inline-flex items-center gap-2 rounded-lg btn-terra px-5 py-2.5 text-sm font-semibold text-white"
      : "inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold hover:bg-muted";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !contato.trim()) {
      toast.error("Preencha seu nome e contato.");
      return;
    }
    toast.success(
      `Mensagem enviada${recipientName ? ` para ${recipientName}` : ""}! Em breve entrarão em contato.`,
    );
    setOpen(false);
    setNome("");
    setContato("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className={`${baseBtn} ${className ?? ""}`}>
          <MessageCircle className="h-4 w-4" /> {triggerLabel}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            Falar sobre este {kind}
          </DialogTitle>
          <DialogDescription>
            Deixe seus dados que {recipientName ?? "o responsável"} retornará em
            até 24h.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="lead-nome">Seu nome</Label>
            <Input
              id="lead-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Como podemos te chamar?"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="lead-contato">E-mail ou telefone</Label>
            <Input
              id="lead-contato"
              value={contato}
              onChange={(e) => setContato(e.target.value)}
              placeholder="email@exemplo.com ou (11) 99999-0000"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="lead-msg">Mensagem</Label>
            <Textarea
              id="lead-msg"
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            {whatsapp && (
              <a
                href={`https://wa.me/55${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(mensagem)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            )}
            <Button type="submit" className="btn-terra text-white">
              <Send className="h-4 w-4 mr-1.5" /> Enviar mensagem
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
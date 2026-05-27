export interface ModerationResult {
  texto: string;
  flags: string[];
}

export function moderarTexto(texto: string): ModerationResult {
  const flags: string[] = [];
  let textoProcessado = texto;
  if (/(\(?\d{2}\)?\s?[\d\s\-]{7,9}\d)/.test(texto)) flags.push("telefone_externo");
  if (/(https?:\/\/[^\s]+)/gi.test(texto)) {
    flags.push("link_externo");
    textoProcessado = textoProcessado.replace(/(https?:\/\/[^\s]+)/gi, "[link removido]");
  }
  if (/pix\s?agora|depósito|transferência\s?adiantada|reserva\s?antes/gi.test(texto)) flags.push("pagamento_suspeito");
  return { texto: textoProcessado, flags };
}

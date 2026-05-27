import type { Listing, User, Review } from "./types";

export function calcularScoreConfianca(anuncio: Listing, usuario: User): number {
  let pts = 0;
  if (usuario.verificacoes.cpf) pts += 20;
  if (usuario.verificacoes.telefone) pts += 10;
  if (usuario.verificacoes.kyc) pts += 20;
  const sit = anuncio.situacaoDocumental;
  if (sit.chassi === "visivelLegivel") pts += 10;
  if (sit.documentosFisicos.length >= 1) pts += 10;
  if (sit.documentoNome && sit.transferenciasAcumuladas && sit.ipva && sit.licenciamento && sit.chassi && sit.motor && sit.multas) pts += 5;
  if (sit.aceitaAjudarRegularizacao === "sim") pts += 5;
  if (anuncio.verificacaoLocalizacao.badge === "verificada") pts += 10;
  if (Math.abs(anuncio.percFipe) <= 40) pts += 5;
  if (!anuncio.fotoDuplicadaFlag) pts += 5;
  if (usuario.sellerScore > 80) pts += 5;
  if (anuncio.photos.length >= 3) pts += 5;
  return Math.min(100, pts);
}

export function calcularSellerScore(usuario: User, avaliacoes: Review[]): number {
  let pts = 0;
  const minhasAv = avaliacoes.filter((r) => r.vendedorId === usuario.id);
  if (minhasAv.length === 0) {
    pts += 30;
  } else {
    const media = minhasAv.reduce((acc, r) => acc + (r.criterios.honestidade + r.criterios.comunicacao + r.criterios.veiculoComoDescrito) / 3, 0) / minhasAv.length;
    pts += Math.round(((media - 1) / 4) * 60);
  }
  const now = new Date();
  const since = new Date(usuario.memberSince);
  const months = (now.getFullYear() - since.getFullYear()) * 12 + (now.getMonth() - since.getMonth());
  if (months >= 12) pts += 20;
  else if (months >= 6) pts += 10;
  if (usuario.verificacoes.kyc) pts += 10;
  else if (usuario.verificacoes.cpf) pts += 5;
  if (usuario.taxaResposta > 95) pts += 10;
  else if (usuario.taxaResposta > 80) pts += 5;
  return Math.min(100, Math.max(0, pts));
}

export function sellerScoreLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: "Excelente ★", color: "text-green-600" };
  if (score >= 70) return { label: "Ótimo", color: "text-green-500" };
  if (score >= 50) return { label: "Regular", color: "text-amber-500" };
  return { label: "⚠️ Baixa reputação", color: "text-red-500" };
}

export function scoreConfiancaBadge(score: number): { label: string; bg: string; text: string } {
  if (score >= 80) return { label: "Anúncio bem documentado ✅", bg: "bg-green-100", text: "text-green-700" };
  if (score >= 50) return { label: "Documentação parcial ⚠️", bg: "bg-amber-100", text: "text-amber-700" };
  return { label: "Documentação não informada", bg: "bg-gray-100", text: "text-gray-600" };
}

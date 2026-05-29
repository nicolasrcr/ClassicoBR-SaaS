import type { ClassicEvent, ServiceListing } from "./types";

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function matches(haystack: string, needle: string): boolean {
  if (!needle) return true;
  return norm(haystack).includes(norm(needle));
}

export function scoreEventRelevance(ev: ClassicEvent, q: string): number {
  if (!q.trim()) {
    // sem busca → proximidade temporal
    const diff = Math.abs(new Date(ev.dataInicio).getTime() - Date.now());
    return 1_000_000 - Math.min(diff / 86400000, 365);
  }
  let s = 0;
  if (matches(ev.titulo, q)) s += 3;
  if (matches(ev.descricao, q)) s += 2;
  if (matches(ev.cidade, q)) s += 1;
  if (matches(ev.estado, q)) s += 1;
  if (matches(ev.endereco, q)) s += 1;
  return s;
}

export function scoreServiceRelevance(sv: ServiceListing, q: string): number {
  if (!q.trim()) return sv.scoreConfianca ?? 0;
  let s = 0;
  if (matches(sv.titulo, q)) s += 3;
  if (matches(sv.descricao, q)) s += 2;
  if (matches(sv.cidade, q)) s += 1;
  if (matches(sv.estado, q)) s += 1;
  if (sv.especialidades.some((e) => matches(e, q))) s += 2;
  return s;
}

export { norm as normalizeText };
import type { ImageTrace, TraceabilityRecord } from "./types";

// IPs simulados (sem chamada externa real)
const BR_IP_POOL = [
  { ip: "177.32.15.201", cidade: "São Paulo", estado: "SP" },
  { ip: "187.50.22.33", cidade: "Rio de Janeiro", estado: "RJ" },
  { ip: "201.17.45.88", cidade: "Belo Horizonte", estado: "MG" },
  { ip: "189.40.22.100", cidade: "Curitiba", estado: "PR" },
  { ip: "177.98.45.10", cidade: "Goiânia", estado: "GO" },
  { ip: "200.10.55.10", cidade: "Recife", estado: "PE" },
  { ip: "189.22.33.78", cidade: "Porto Alegre", estado: "RS" },
];

function pickIp(seed: number) {
  return BR_IP_POOL[seed % BR_IP_POOL.length];
}

async function sha256(data: ArrayBuffer): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  // fallback determinístico simples
  let h = 0;
  const bytes = new Uint8Array(data);
  for (let i = 0; i < bytes.length; i++) h = (h * 31 + bytes[i]) | 0;
  return "fallback_" + Math.abs(h).toString(16);
}

function browserFingerprint(): string {
  if (typeof window === "undefined" || typeof navigator === "undefined") return "fp_ssr";
  const scr = typeof screen !== "undefined" ? screen : undefined;
  const raw = [
    navigator.userAgent,
    navigator.language,
    String(scr?.width ?? 0) + "x" + String(scr?.height ?? 0),
    String(new Date().getTimezoneOffset()),
  ].join("|");
  let h = 0;
  for (let i = 0; i < raw.length; i++) h = (h * 131 + raw.charCodeAt(i)) | 0;
  return "fp_" + Math.abs(h).toString(16).padStart(8, "0");
}

// Hashes já vistos na sessão — detecta reuso de imagem dentro da publicação
const seenHashes = new Map<string, string>();

export async function analyzeImageFile(file: File): Promise<ImageTrace> {
  const buf = await file.arrayBuffer();
  const hash = await sha256(buf);
  const reutilizadaDeAnuncioId = seenHashes.get(hash);
  if (!reutilizadaDeAnuncioId) seenHashes.set(hash, "current");

  // EXIF real exigiria parser; sinalizamos ausência se o tipo for png/webp (geralmente sem EXIF)
  const provavelmenteSemExif = /png|webp/i.test(file.type);

  return {
    nome: file.name,
    tamanhoBytes: file.size,
    tipoMime: file.type || "application/octet-stream",
    hashSha256: hash,
    capturadoEm: provavelmenteSemExif ? undefined : new Date(file.lastModified).toISOString(),
    camera: provavelmenteSemExif ? undefined : "EXIF não extraído (preview)",
    origemSuspeita: provavelmenteSemExif || Boolean(reutilizadaDeAnuncioId),
    reutilizadaDeAnuncioId,
  };
}

export interface BuildTraceArgs {
  estadoAnuncio: string;
  imagens: ImageTrace[];
}

export function buildTraceability({ estadoAnuncio, imagens }: BuildTraceArgs): TraceabilityRecord {
  const seed = Date.now() & 0xff;
  const ip = pickIp(seed);
  const divergencia = estadoAnuncio !== "" && ip.estado !== estadoAnuncio;

  // score: começa em 100, penaliza por: sem imagens, imagens suspeitas, divergência geo
  let score = 100;
  if (imagens.length === 0) score -= 25;
  const suspeitas = imagens.filter((i) => i.origemSuspeita).length;
  score -= suspeitas * 10;
  if (divergencia) score -= 20;
  score = Math.max(0, Math.min(100, score));

  return {
    ip: ip.ip,
    cidadeIp: ip.cidade,
    estadoIp: ip.estado,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 120) : "ssr",
    fingerprint: browserFingerprint(),
    submetidoEm: new Date().toISOString(),
    imagens,
    divergenciaLocalizacao: divergencia,
    scoreOrigem: score,
  };
}

export function mockTraceability(estado: string, n = 2): TraceabilityRecord {
  const imagens: ImageTrace[] = Array.from({ length: n }).map((_, i) => ({
    nome: `foto_${i + 1}.jpg`,
    tamanhoBytes: 800_000 + i * 120_000,
    tipoMime: "image/jpeg",
    hashSha256: "demo_" + Math.random().toString(16).slice(2, 18),
    capturadoEm: new Date(Date.now() - i * 86400000).toISOString(),
    camera: i % 2 === 0 ? "Apple iPhone 13" : "Samsung Galaxy S22",
    origemSuspeita: false,
  }));
  return buildTraceability({ estadoAnuncio: estado, imagens });
}
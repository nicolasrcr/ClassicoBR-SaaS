export function formatPrice(price: number | null): string {
  if (price == null) return "Preço a consultar";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function formatKm(km: number): string {
  return new Intl.NumberFormat("pt-BR").format(km) + " km";
}

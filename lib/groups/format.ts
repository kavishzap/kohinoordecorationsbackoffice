export function formatGroupPrice(price: number | null | undefined): string {
  if (price == null) return "—";
  const value = Number(price);
  if (!Number.isFinite(value)) return "—";
  return `Rs ${value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

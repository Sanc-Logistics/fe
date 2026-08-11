/**
 * Stock badge next to product names in pickers.
 * - stock null → no badge (unlimited / no data)
 * - stock === 0 → red "재고 없음"
 * - stock > 0 → "remaining/capacity" (e.g. 2/3)
 *   capacity = stockMax, or stock when stockMax is missing
 */
export function formatProductStockLabel(
  stock: number | null | undefined,
  stockMax?: number | null,
): { kind: "none" } | { kind: "out" } | { kind: "qty"; text: string } {
  if (stock === null || stock === undefined) {
    return { kind: "none" };
  }

  if (stock <= 0) {
    return { kind: "out" };
  }

  const capacity =
    stockMax !== null && stockMax !== undefined && stockMax > 0
      ? stockMax
      : stock;

  return {
    kind: "qty",
    text: `${stock.toLocaleString("ko-KR")}/${capacity.toLocaleString("ko-KR")}`,
  };
}

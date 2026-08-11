import { formatProductStockLabel } from "@/lib/product-stock";
import { cn } from "@/lib/utils";

/** Renders product name with remaining/capacity stock (e.g. 2/3) or out-of-stock. */
export function ProductNameWithStock({
  name,
  stock,
  stockMax,
  className,
  nameClassName,
}: {
  name: string;
  stock?: number | null;
  stockMax?: number | null;
  className?: string;
  nameClassName?: string;
}) {
  const label = formatProductStockLabel(stock, stockMax);

  return (
    <p className={cn("text-sm leading-snug text-ink", className)}>
      <span className={cn("font-bold", nameClassName)}>{name}</span>
      {label.kind === "qty" ? (
        <span className="ml-1.5 font-medium text-[#475569]">{label.text}</span>
      ) : null}
      {label.kind === "out" ? (
        <span className="ml-1.5 font-semibold text-red">재고 없음</span>
      ) : null}
    </p>
  );
}

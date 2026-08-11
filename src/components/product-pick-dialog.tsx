"use client";

import { useEffect, useMemo, useState } from "react";

import { ProductNameWithStock } from "@/components/product-name-with-stock";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { apiFetch } from "@/lib/api";

const DEFAULT_PRODUCT_IMAGE = "/assets/images/No_img.jpg";

type StockCatalogItem = {
  id: number;
  code: string;
  imageUrl: string | null;
  productName: string;
  spec: string | null;
  unit: number;
  stock?: number | null;
  stockMax?: number | null;
  wholesalePrice: number;
  category: string;
};

function productImageSrc(imageUrl: string | null | undefined) {
  const trimmed = imageUrl?.trim();
  return trimmed ? trimmed : DEFAULT_PRODUCT_IMAGE;
}

/** Single-product picker (name only) for admin tools. */
export function ProductPickDialog({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (productName: string) => void;
}) {
  const [catalog, setCatalog] = useState<StockCatalogItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    const loadCatalog = async () => {
      setIsLoading(true);
      setLoadError("");
      setKeyword("");
      setCategoryFilter("all");

      try {
        const response = await apiFetch("/api/stock-inventory");
        const data = (await response.json()) as
          | StockCatalogItem[]
          | { message?: string };

        if (!response.ok || !Array.isArray(data) || cancelled) {
          if (!cancelled) {
            setLoadError(
              !Array.isArray(data) && data.message
                ? data.message
                : "상품 목록을 불러오지 못했습니다.",
            );
            setCatalog([]);
          }
          return;
        }

        setCatalog(data);
      } catch {
        if (!cancelled) {
          setLoadError("상품 목록을 불러오지 못했습니다.");
          setCatalog([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadCatalog();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const filteredCatalog = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return catalog.filter((item) => {
      if (categoryFilter !== "all" && item.category !== categoryFilter) {
        return false;
      }
      if (!normalizedKeyword) {
        return true;
      }
      return (
        item.productName.toLowerCase().includes(normalizedKeyword) ||
        item.code.toLowerCase().includes(normalizedKeyword) ||
        (item.spec ?? "").toLowerCase().includes(normalizedKeyword)
      );
    });
  }, [catalog, keyword, categoryFilter]);

  const handlePick = (productName: string) => {
    onSelect(productName);
    onClose();
  };

  return (
    <Dialog
      open={open}
      title="상품명 검색"
      onClose={onClose}
      className="max-w-lg"
    >
      <div className="space-y-3">
        <p className="text-sm text-[#64748b]">
          상품을 선택하면 상품명이 입력란에 반영됩니다.
        </p>

        <div className="grid gap-2 min-[480px]:grid-cols-[140px_1fr]">
          <select
            aria-label="구분 필터"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="min-h-9 w-full rounded-[7px] border border-[#cbd5e1] bg-white px-2.5 py-2 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
            <option value="all">전체</option>
            <option value="선물세트">선물세트</option>
            <option value="일반품">일반품</option>
          </select>
          <input
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="품명 / 코드 / 규격 검색"
            className="min-h-9 w-full rounded-[7px] border border-[#cbd5e1] bg-white px-2.5 py-2 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>

        {isLoading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            상품 목록을 불러오는 중...
          </p>
        ) : loadError ? (
          <p className="rounded-[7px] border border-red/30 bg-[#fff0ed] px-3 py-2 text-sm text-red">
            {loadError}
          </p>
        ) : filteredCatalog.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            검색 결과가 없습니다.
          </p>
        ) : (
          <div className="max-h-[50vh] divide-y divide-[#e5eaf0] overflow-y-auto rounded-lg border border-line">
            {filteredCatalog.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handlePick(item.productName)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-[#f6f8fb]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={productImageSrc(item.imageUrl)}
                  alt=""
                  className="size-12 shrink-0 rounded-md border border-line object-cover"
                />
                <div className="min-w-0 flex-1">
                  <ProductNameWithStock
                    name={item.productName}
                    stock={item.stock}
                    stockMax={item.stockMax}
                    nameClassName="font-medium"
                  />
                  <p className="truncate text-xs text-muted-foreground">
                    {item.code}
                    {item.spec ? ` · ${item.spec}` : ""}
                    {item.category ? ` · ${item.category}` : ""}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-medium text-brand">
                  선택
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

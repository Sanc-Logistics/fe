"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";

export type OrderShipType = "택배" | "배달";

export interface PrintOrderItem {
  product: string;
  qty: number;
  note: string;
}

export interface PrintOrderPreview {
  id: string;
  storeName: string;
  type: OrderShipType;
  orderDate: string;
  name: string;
  phone: string;
  shipDate: string;
  items: PrintOrderItem[];
  detailNote?: string;
  guideText?: string;
}

const SAMPLE_PRINT_ORDERS: PrintOrderPreview[] = [
  {
    id: "ORD-0001",
    storeName: "신앙촌 상회",
    type: "택배",
    orderDate: "2026-01-10",
    name: "이순희",
    phone: "010-1234-5678",
    shipDate: "2026-01-16",
    items: [
      { product: "명진 1호", qty: 300, note: "개별택배" },
      { product: "S5호", qty: 200, note: "개별택배" },
    ],
    detailNote: "",
    guideText: "택배 주문서 작성 기준 / 발송 기준 안내문",
  },
  {
    id: "ORD-0002",
    storeName: "신앙촌 상회",
    type: "배달",
    orderDate: "2026-01-11",
    name: "김주문",
    phone: "010-2222-3333",
    shipDate: "2026-01-18",
    items: [{ product: "S5호", qty: 200, note: "창고픽업" }],
    detailNote: "",
    guideText: "배달 주문서 작성 기준 / 배달 완료 기준 안내문",
  },
  {
    id: "ORD-0003",
    storeName: "신앙촌 상회",
    type: "택배",
    orderDate: "2026-01-12",
    name: "박보내",
    phone: "010-3333-4444",
    shipDate: "2026-01-20",
    items: [
      { product: "특선1호", qty: 120, note: "개별택배" },
      { product: "명진 1호", qty: 80, note: "묶음배송" },
      { product: "기쁨1호", qty: 40, note: "명함 동봉" },
    ],
    detailNote: "",
    guideText: "택배 주문서 작성 기준 / 발송 기준 안내문",
  },
];

function OrderTypeMark({
  label,
  checked,
}: {
  label: OrderShipType;
  checked: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
      <span
        aria-hidden
        className={cn(
          "inline-flex size-4 items-center justify-center rounded-[3px] border border-[#334155] bg-white text-[11px] leading-none",
          checked ? "text-[#111827]" : "text-transparent",
        )}
      >
        {checked ? "✓" : ""}
      </span>
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        readOnly
        tabIndex={-1}
        aria-label={`${label}${checked ? " 선택됨" : " 미선택"}`}
        className="sr-only"
      />
    </span>
  );
}

function PrintSheet({ order }: { order: PrintOrderPreview }) {
  const shipDateLabel = order.type === "택배" ? "택배 발송일" : "배달 완료일";
  const itemRowColors = ["#bfc1c0", "#cbcbcb"] as const;

  return (
    <div className="overflow-hidden rounded-md border border-[#1f2937] bg-white print:rounded-none print:border-black">
      <div className="grid grid-cols-1 border-b border-[#94a3b8] min-[1040px]:grid-cols-[1.4fr_0.9fr]">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-[#facc15] px-3 py-2.5">
          <strong className="text-sm font-bold text-ink">[ {order.storeName} ]</strong>
          <div className="flex items-center gap-4">
            <OrderTypeMark label="택배" checked={order.type === "택배"} />
            <OrderTypeMark label="배달" checked={order.type === "배달"} />
          </div>
        </div>
        <div className="hidden items-center justify-end border-t border-[#94a3b8] px-3 py-2.5 text-sm text-ink min-[1040px]:flex min-[1040px]:border-t-0 min-[1040px]:border-l">
          주문일자 {order.orderDate}
        </div>
      </div>

      {/* Mobile: values only / Desktop: with field titles */}
      <div className="border-b border-[#94a3b8] bg-[#b3b7b6] px-3 py-3 text-center text-sm text-ink min-[1040px]:hidden">
        {order.name} / {order.phone} / {order.shipDate}
      </div>
      <div className="hidden border-b border-[#94a3b8] bg-[#b3b7b6] px-3 py-3 text-center text-sm text-ink min-[1040px]:block">
        성명 {order.name} / 연락처 {order.phone} / {shipDateLabel} {order.shipDate}
      </div>

      <div className="h-[22px] border-b border-[#94a3b8] bg-white" aria-hidden />

      <div className="border-b border-[#94a3b8] bg-[#c3c5c4] px-3 py-3 text-center text-sm font-bold text-ink">
        [ 선물세트 주문 내역 ]
      </div>

      <div className="h-[12px] border-b border-[#94a3b8] bg-white" aria-hidden />

      {/* Column headers: desktop only */}
      <div className="hidden border-b border-[#94a3b8] bg-[#c4c8c7] px-3 py-2.5 text-center text-sm text-ink min-[1040px]:block">
        주문 제품명 | 주문 수량 | 주문 요청 사항
      </div>

      {order.items.map((item, index) => (
        <div key={`${item.product}-${item.qty}-${item.note}`}>
          <div
            className="border-b border-[#94a3b8] px-3 py-2.5 text-center text-sm text-ink"
            style={{ backgroundColor: itemRowColors[index % itemRowColors.length] }}
          >
            {item.product} | {item.qty} | {item.note}
          </div>
          {index < order.items.length - 1 ? (
            <div className="h-[10px] border-b border-[#94a3b8] bg-white min-[1040px]:hidden" aria-hidden />
          ) : null}
        </div>
      ))}

      {/* Detail section: desktop only */}
      <div className="hidden min-[1040px]:block">
        <div className="h-[18px] border-b border-[#94a3b8] bg-white" aria-hidden />
        <div className="border-b border-[#94a3b8] bg-[#c3c5c4] px-3 py-3 text-center text-sm font-bold text-ink">
          [ 선물세트 주문 상세 내역 ]
        </div>
        {/* <div className="min-h-12 border-b border-[#94a3b8] px-3 py-3 text-center text-sm text-ink">
          {order.detailNote || "\u00A0"}
        </div> */}
      </div>

      <div className="h-[12px] border-b border-[#94a3b8] bg-white" aria-hidden />

      <div
        className="min-h-12 px-3 py-3 text-center text-sm font-semibold"
        style={{
          backgroundColor: "#bec2c1",
          border: "2px solid #462627",
          color: "#462627",
        }}
      >
        <span className="min-[1040px]:hidden">발송 기준 안내문</span>
        <span className="hidden min-[1040px]:inline">
          {order.guideText ?? "택배 주문서 작성 기준 / 발송 기준 안내문"}
        </span>
      </div>
    </div>
  );
}

export function OrderPrintPreview({
  orders = SAMPLE_PRINT_ORDERS,
  initialOrderId,
}: {
  orders?: PrintOrderPreview[];
  initialOrderId?: string;
}) {
  const [selectedOrderId, setSelectedOrderId] = useState(
    initialOrderId ?? orders[0]?.id ?? "",
  );

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? orders[0],
    [orders, selectedOrderId],
  );

  const handlePrint = () => {
    window.print();
  };

  if (!selectedOrder) {
    return (
      <p className="rounded-lg border border-line bg-white px-3.5 py-6 text-center text-sm text-muted-foreground">
        출력할 주문이 없습니다.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 print:hidden min-[900px]:flex-row min-[900px]:items-center min-[900px]:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-ink min-[1040px]:text-[22px]">
            주문서 미리보기
          </h3>
          <p className="mt-1 hidden text-[13px] text-muted-foreground min-[1040px]:block">
            선택한 주문의 구분(택배/배달)이 표시된 출력용 미리보기입니다.
          </p>
        </div>
        <div className="hidden flex-wrap gap-2 min-[1040px]:flex">
          <Button
            type="button"
            className="border-[#0f766e] bg-[#0f766e] text-white hover:bg-[#0d9488]"
          >
            PDF 저장
          </Button>
          <Button
            type="button"
            className="border-[#1d4ed8] bg-[#1d4ed8] text-white hover:bg-[#1e40af]"
            onClick={handlePrint}
          >
            인쇄
          </Button>
        </div>
      </div>

      <div className="max-w-xs print:hidden">
        <Dropdown
          label="출력 주문"
          value={selectedOrder.id}
          options={orders.map((order) => ({
            value: order.id,
            label: `${order.id} · ${order.name} (${order.type})`,
          }))}
          onChange={setSelectedOrderId}
        />
      </div>

      <PrintSheet order={selectedOrder} />

      <div className="grid grid-cols-2 gap-2 print:hidden min-[1040px]:hidden">
        <Button
          type="button"
          className="h-11 border-[#334155] bg-[#334155] text-white hover:bg-[#1f2937]"
        >
          PDF 저장
        </Button>
        <Button
          type="button"
          className="h-11 border-[#1d4ed8] bg-[#1d4ed8] text-white hover:bg-[#1e40af]"
          onClick={handlePrint}
        >
          인쇄
        </Button>
      </div>
    </div>
  );
}

export default OrderPrintPreview;

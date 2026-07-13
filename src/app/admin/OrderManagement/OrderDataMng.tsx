"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Table, type TableColumn } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface OrderMasterRow {
  [key: string]: string | number;
  id: string;
  type: string;
  name: string;
  productCount: number;
  totalQty: number;
}

interface OrderDetailRow {
  [key: string]: string | number;
  orderId: string;
  seq: number;
  product: string;
  qty: number;
}

const ORDER_MASTERS: OrderMasterRow[] = [
  {
    id: "ORD-0001",
    type: "택배",
    name: "이순희",
    productCount: 2,
    totalQty: 500,
  },
  {
    id: "ORD-0002",
    type: "배달",
    name: "김주문",
    productCount: 2,
    totalQty: 150,
  },
  {
    id: "ORD-0003",
    type: "택배",
    name: "박담당",
    productCount: 1,
    totalQty: 120,
  },
];

const ORDER_DETAILS: OrderDetailRow[] = [
  { orderId: "ORD-0001", seq: 1, product: "명진 1호", qty: 300 },
  { orderId: "ORD-0001", seq: 2, product: "S5호", qty: 200 },
  { orderId: "ORD-0002", seq: 1, product: "특선1호", qty: 100 },
  { orderId: "ORD-0002", seq: 2, product: "기쁨1호", qty: 50 },
  { orderId: "ORD-0003", seq: 1, product: "S5호", qty: 120 },
];

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
        .join(","),
    )
    .join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function OrderDataMng() {
  const [selectedOrderId, setSelectedOrderId] = useState(ORDER_MASTERS[0]?.id ?? "");

  const selectedDetails = useMemo(
    () => ORDER_DETAILS.filter((item) => item.orderId === selectedOrderId),
    [selectedOrderId],
  );

  const masterColumns: TableColumn<OrderMasterRow>[] = [
    { key: "id", header: "주문번호" },
    { key: "type", header: "구분" },
    { key: "name", header: "성명" },
    { key: "productCount", header: "상품건수", className: "text-right" },
    { key: "totalQty", header: "총수량", className: "text-right" },
  ];

  const detailColumns: TableColumn<OrderDetailRow>[] = [
    { key: "orderId", header: "주문번호" },
    { key: "seq", header: "순번", className: "text-right" },
    { key: "product", header: "제품명" },
    { key: "qty", header: "수량", className: "text-right" },
  ];

  const handleExportExcel = () => {
    const master = ORDER_MASTERS.find((order) => order.id === selectedOrderId);
    const rows: string[][] = [
      ["주문번호", "구분", "성명", "상품건수", "총수량"],
      master
        ? [
            master.id,
            master.type,
            master.name,
            String(master.productCount),
            String(master.totalQty),
          ]
        : [],
      [],
      ["주문번호", "순번", "제품명", "수량"],
      ...selectedDetails.map((item) => [
        item.orderId,
        String(item.seq),
        item.product,
        String(item.qty),
      ]),
    ];

    downloadCsv(`주문데이터_${selectedOrderId || "all"}.csv`, rows);
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold text-ink min-[1040px]:text-[22px]"></h3>
        <p className="mt-1 text-[13px] text-muted-foreground">
          주문마스터를 선택하면 해당 주문의 상품상세가 표시됩니다.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <section className="min-w-0 rounded-lg border border-line bg-panel p-3.5">
          <h4 className="mb-2.5 text-base font-semibold text-ink">주문마스터</h4>
          <Table
            caption="주문마스터"
            columns={masterColumns}
            data={ORDER_MASTERS}
            onRowClick={(row) => setSelectedOrderId(row.id)}
            getRowClassName={(row) =>
              cn(
                row.id === selectedOrderId &&
                  "bg-[#e9f1ff] font-semibold hover:bg-[#e9f1ff]",
              )
            }
          />
        </section>

        <section className="min-w-0 rounded-lg border border-line bg-panel p-3.5">
          <h4 className="mb-2.5 text-base font-semibold text-ink">상품상세</h4>
          <Table
            caption={`${selectedOrderId} 상품상세`}
            columns={detailColumns}
            data={selectedDetails}
            emptyMessage="선택한 주문의 상품이 없습니다."
          />
        </section>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          className="border-[#1f2937] bg-[#1f2937] text-white hover:bg-[#111827]"
          onClick={handleExportExcel}
        >
          엑셀 내보내기
        </Button>
      </div>
    </div>
  );
}

export default OrderDataMng;

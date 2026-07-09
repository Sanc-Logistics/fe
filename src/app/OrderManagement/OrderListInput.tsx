"use client";

import { useRef, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Chip, type ChipVariant } from "@/components/ui/chip";
import { Dropdown } from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import { Table, type TableColumn } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const MEMBER_NAV = ["제품주문서", "인사장", "내 주문 현황", "엑셀"] as const;
const PRODUCT_TABS = ["제품주문서", "인사장 탭", "인사장만"] as const;
const GREETING_TABS = ["제품주문 연계", "인사장만 의뢰"] as const;
const GREETING_NUMBERS = ["1", "2", "3", "4", "자체"] as const;
const GREETING_SIZES = ["8칸", "6칸", "4칸"] as const;

type ProductTab = (typeof PRODUCT_TABS)[number];
type GreetingTab = (typeof GREETING_TABS)[number];

interface ProductLineItem {
  [key: string]: string | number;
  product: string;
  qty: number;
  note: string;
  greeting: string;
}

interface OrderRow {
  [key: string]: string | number;
  id: string;
  type: string;
  greeting: string;
  status: string;
  total: number;
}

const INITIAL_PRODUCT_ITEMS: ProductLineItem[] = [
  { product: "명진 1호", qty: 300, note: "개별택배", greeting: "제작대기" },
  { product: "S5호", qty: 200, note: "개별택배", greeting: "1번 / 8칸" },
];

const INITIAL_ORDERS: OrderRow[] = [
  {
    id: "ORD-202601-0001",
    type: "택배",
    greeting: "연계",
    status: "제작중",
    total: 500,
  },
  {
    id: "ORD-202601-0002",
    type: "배달",
    greeting: "없음",
    status: "관리자 확인중",
    total: 150,
  },
  {
    id: "GR-202601-0003",
    type: "인사장만",
    greeting: "단독",
    status: "인사장 접수",
    total: 300,
  },
];

const STATUS_VARIANT: Record<string, ChipVariant> = {
  접수완료: "blue",
  "관리자 확인중": "yellow",
  보완요청: "red",
  "공장 공유완료": "purple",
  제작중: "purple",
  "인사장 접수": "blue",
  제작대기: "yellow",
  시안확인: "purple",
  제작완료: "green",
  출고완료: "green",
};

function StatusChip({ status }: { status: string }) {
  return <Chip variant={STATUS_VARIANT[status] ?? "blue"}>{status}</Chip>;
}

function SegTabs<T extends string>({
  items,
  value,
  onChange,
}: {
  items: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="mb-3 flex flex-wrap gap-1.5">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          className={cn(
            "rounded-full border px-2.5 py-1.5 text-xs font-bold transition-colors",
            value === item
              ? "border-[#9bbcff] bg-[#e9f1ff] text-brand"
              : "border-line bg-white text-ink hover:bg-soft",
          )}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function ChoiceGrid<T extends string>({
  label,
  items,
  value,
  onChange,
  columns = items.length,
}: {
  label: string;
  items: readonly T[];
  value: T;
  onChange: (value: T) => void;
  columns?: number;
}) {
  return (
    <div className="mt-2.5">
      <label className="mb-1.5 block text-xs text-[#475569]">{label}</label>
      <div
        className="grid overflow-hidden rounded-[7px] border border-line"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className={cn(
              "border-r border-line px-1 py-2 text-center text-xs font-bold last:border-r-0",
              value === item ? "bg-[#e9f1ff] text-brand" : "bg-white text-ink hover:bg-soft",
            )}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function Panel({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("min-w-0 rounded-lg border border-line bg-panel p-3.5", className)}>
      {title ? <h4 className="mb-2.5 text-base font-semibold text-ink">{title}</h4> : null}
      {children}
    </section>
  );
}

function MemberSidebar({ activeIndex = 0 }: { activeIndex?: number }) {
  return (
    <aside className="bg-[#1f2937] px-3.5 py-4 text-[#e5edf7]">
      <strong className="mb-4 block text-base">개인회원</strong>
      <nav className="space-y-1.5">
        {MEMBER_NAV.map((item, index) => (
          <span
            key={item}
            className={cn(
              "block rounded-[7px] px-2.5 py-2.5 text-[13px]",
              index === activeIndex
                ? "bg-[#334155] font-bold text-white"
                : "text-[#cbd5e1]",
            )}
          >
            {item}
          </span>
        ))}
      </nav>
    </aside>
  );
}

function GreetingForm({
  greetingTab,
  onGreetingTabChange,
}: {
  greetingTab: GreetingTab;
  onGreetingTabChange: (tab: GreetingTab) => void;
}) {
  const [greetingNumber, setGreetingNumber] =
    useState<(typeof GREETING_NUMBERS)[number]>("1");
  const [greetingSize, setGreetingSize] =
    useState<(typeof GREETING_SIZES)[number]>("8칸");
  const [specialNote, setSpecialNote] = useState(
    "제품 안에 넣고, 스티커 인사장 붙이기",
  );

  return (
    <>
      <SegTabs items={GREETING_TABS} value={greetingTab} onChange={onGreetingTabChange} />

      <div className="grid grid-cols-1 gap-2.5 min-[900px]:grid-cols-2">
        <Input label="소속, 이름" defaultValue="기장신앙촌 홍길동" />
        <Input label="연락처" defaultValue="010-1234-5678" />
      </div>

      <ChoiceGrid
        label="인사장번호"
        items={GREETING_NUMBERS}
        value={greetingNumber}
        onChange={setGreetingNumber}
      />

      <div className="mt-2.5 grid grid-cols-1 gap-2.5 min-[900px]:grid-cols-2">
        <Input label="인사장내용" defaultValue="신앙촌 새마을금고 본점" />
        <Input label="수량" defaultValue="300" />
      </div>

      <ChoiceGrid
        label="크기"
        items={GREETING_SIZES}
        value={greetingSize}
        onChange={setGreetingSize}
        columns={3}
      />

      <div className="mt-2.5 grid grid-cols-1 gap-2.5 min-[900px]:grid-cols-2">
        <Input label="제품명" defaultValue="명진 1호" />
        <Input label="받을 곳 / 납기" defaultValue="중부 / 2026-01-16" />
      </div>

      <div className="mt-2.5">
        <label htmlFor="special-note" className="mb-1.5 block text-xs text-[#475569]">
          특이사항
        </label>
        <textarea
          id="special-note"
          value={specialNote}
          onChange={(event) => setSpecialNote(event.target.value)}
          className="min-h-[74px] w-full resize-none rounded-[7px] border border-[#cbd5e1] bg-white px-2.5 py-2 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div className="mt-2.5 rounded-[7px] border border-[#f0c15a] bg-[#fff6dc] px-2.5 py-2 text-xs text-[#7a4e00]">
        기쁨1호, 특선1호는 세로형으로 제작됩니다. 해당 제품이면 제품명을 꼭 적어주세요.
      </div>
    </>
  );
}

export function OrderListInput() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [productTab, setProductTab] = useState<ProductTab>("제품주문서");
  const [greetingTab, setGreetingTab] = useState<GreetingTab>("제품주문 연계");
  const [productItems] = useState(INITIAL_PRODUCT_ITEMS);
  const [orders] = useState(INITIAL_ORDERS);

  const productColumns: TableColumn<ProductLineItem>[] = [
    { key: "product", header: "상품명" },
    { key: "qty", header: "수량" },
    { key: "note", header: "요청사항" },
    {
      key: "greeting",
      header: "인사장",
      render: (row) =>
        row.greeting === "제작대기" ? (
          <StatusChip status="제작대기" />
        ) : (
          row.greeting
        ),
    },
  ];

  const orderColumns: TableColumn<OrderRow>[] = [
    { key: "id", header: "접수번호" },
    { key: "type", header: "구분" },
    { key: "greeting", header: "인사장" },
    {
      key: "status",
      header: "상태",
      render: (row) => <StatusChip status={row.status} />,
    },
    { key: "total", header: "수량", className: "text-right" },
    {
      key: "action",
      header: "작업",
      render: () => (
        <Button variant="outline" size="sm">
          보기
        </Button>
      ),
    },
  ];

  return (
    <div className="grid min-h-[730px] grid-cols-1 overflow-hidden rounded-[10px] border border-[#cbd3df] bg-white min-[1040px]:grid-cols-[200px_1fr]">
      <MemberSidebar activeIndex={0} />

      <section className="bg-[#f7f9fc] p-4">
        <div className="mb-3.5 flex flex-col gap-3 min-[1100px]:flex-row min-[1100px]:items-start min-[1100px]:justify-between">
          <div>
            <h3 className="text-[22px] font-semibold text-ink">제품주문서 + 인사장 접수</h3>
            <p className="mt-1 text-[13px] text-muted-foreground">
              제품 주문에 인사장을 연결하거나, 인사장만 별도 작업의뢰할 수 있습니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button className="border-brand bg-brand text-white hover:bg-[#1856bf]">
              신규 주문
            </Button>
            <Button className="border-green bg-green text-white hover:bg-[#128a52]">
              인사장만 의뢰
            </Button>
            <Button variant="outline">인사장 다운로드</Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              엑셀 업로드
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5 min-[1200px]:grid-cols-[minmax(0,1.08fr)_minmax(330px,0.92fr)]">
          <Panel>
            <SegTabs items={PRODUCT_TABS} value={productTab} onChange={setProductTab} />

            <h4 className="mb-2.5 text-base font-semibold text-ink">제품 주문</h4>

            <div className="grid grid-cols-1 gap-2.5 min-[900px]:grid-cols-2">
              <Dropdown
                label="주문구분"
                defaultValue="delivery"
                options={[
                  { value: "delivery", label: "택배" },
                  { value: "pickup", label: "배달" },
                ]}
              />
              <Input label="주문일자" type="date" defaultValue="2026-01-10" />
              <Input label="성명" defaultValue="이순희" />
              <Input label="연락처" defaultValue="010-1234-5678" />
            </div>

            <div className="mt-3">
              <Table caption="제품 주문 상품 목록" columns={productColumns} data={productItems} />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="outline">상품 추가</Button>
              <Button className="border-brand bg-brand text-white hover:bg-[#1856bf]">
                인사장 작성
              </Button>
              <Button className="border-green bg-green text-white hover:bg-[#128a52]">
                접수하기
              </Button>
            </div>

            <h4 className="mb-2.5 mt-4 text-base font-semibold text-ink">내 주문 현황</h4>
            <Table caption="내 주문 현황" columns={orderColumns} data={orders} />
          </Panel>

          <Panel title="인사장 작업의뢰">
            <GreetingForm greetingTab={greetingTab} onGreetingTabChange={setGreetingTab} />

            <div className="mt-3 flex flex-wrap gap-2">
              <Button className="border-brand bg-brand text-white hover:bg-[#1856bf]">
                인사장 저장
              </Button>
              <Button className="border-green bg-green text-white hover:bg-[#128a52]">
                인사장만 접수
              </Button>
            </div>
          </Panel>
        </div>
      </section>
    </div>
  );
}

export default OrderListInput;

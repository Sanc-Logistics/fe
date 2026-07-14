"use client";

import { Check, Menu, Plus, X } from "lucide-react";
import { useRef, useState, useEffect, type ReactNode } from "react";

import { LogoutButton } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { Chip, type ChipVariant } from "@/components/ui/chip";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, type TableColumn } from "@/components/ui/table";
import { getAuthUser, saveAuthUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

const MEMBER_NAV = ["제품주문서", "인사장", "내 주문 현황", "엑셀"] as const;
const GREETING_TABS = ["제품주문 연계", "인사장만 의뢰"] as const;
const GREETING_NUMBERS = ["1", "2", "3", "4", "자체"] as const;
const GREETING_SIZES = ["8칸", "6칸", "4칸"] as const;
const ORDER_TYPES = [
  { value: "delivery", label: "택배" },
  { value: "pickup", label: "배달" },
] as const;

type OrderType = (typeof ORDER_TYPES)[number]["value"];

type MemberNav = (typeof MEMBER_NAV)[number];
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

const PAGE_META: Record<
  MemberNav,
  { title: string; description: string }
> = {
  제품주문서: {
    title: "제품주문서",
    description: "상품별 주문수량과 인사장 연계 여부를 작성합니다.",
  },
  인사장: {
    title: "인사장 작업의뢰",
    description: "제품주문 연계 또는 인사장만 별도 작업의뢰를 접수합니다.",
  },
  "내 주문 현황": {
    title: "내 주문 현황",
    description: "접수한 주문과 인사장 작업 상태를 확인합니다.",
  },
  엑셀: {
    title: "엑셀",
    description: "주문/인사장 데이터를 엑셀로 업로드하거나 다운로드합니다.",
  },
};

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

function useMinWidth(minWidth: number) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${minWidth}px)`);
    const update = () => setMatches(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, [minWidth]);

  return matches;
}

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

function OrderTypeToggle({
  value,
  onChange,
  compact = false,
}: {
  value: OrderType;
  onChange: (value: OrderType) => void;
  compact?: boolean;
}) {
  return (
    <div className={cn(compact ? "shrink-0" : "w-full")}>
      {!compact ? (
        <label className="mb-1.5 block text-xs text-[#475569]">주문구분</label>
      ) : null}
      <div className="flex gap-2">
        {ORDER_TYPES.map((option) => {
          const isActive = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(option.value)}
              className={cn(
                "inline-flex min-h-9 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold text-white transition-colors",
                compact ? "min-w-[92px]" : "flex-1",
                isActive ? "bg-[#16995f]" : "bg-[#1f2937] hover:opacity-90",
              )}
            >
              {isActive ? (
                <span className="flex size-4 shrink-0 items-center justify-center rounded-[3px] bg-[#d8dce8] text-[#16995f]">
                  <Check className="size-3" strokeWidth={3} />
                </span>
              ) : null}
              {option.label}
            </button>
          );
        })}
      </div>
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

function MemberNavList({
  activeMenu,
  onMenuChange,
}: {
  activeMenu: MemberNav;
  onMenuChange: (menu: MemberNav) => void;
}) {
  return (
    <nav className="space-y-1.5">
      {MEMBER_NAV.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onMenuChange(item)}
          className={cn(
            "block w-full rounded-[7px] px-2.5 py-2.5 text-left text-[13px] transition-colors",
            activeMenu === item
              ? "bg-[#334155] font-bold text-white"
              : "text-[#cbd5e1] hover:bg-[#2b3648]",
          )}
        >
          {item}
        </button>
      ))}
    </nav>
  );
}

function MemberSidebar({
  activeMenu,
  onMenuChange,
}: {
  activeMenu: MemberNav;
  onMenuChange: (menu: MemberNav) => void;
}) {
  return (
    <aside className="hidden bg-[#1f2937] px-3.5 py-4 text-[#e5edf7] min-[1040px]:flex min-[1040px]:flex-col">
      <strong className="mb-4 block text-base">개인회원</strong>
      <div className="flex-1">
        <MemberNavList activeMenu={activeMenu} onMenuChange={onMenuChange} />
      </div>
      <LogoutButton className="mt-4 w-full rounded-[7px] px-2.5 py-2 text-left text-[13px] text-[#cbd5e1] hover:bg-[#2b3648]" />
    </aside>
  );
}

function MobileMemberHeader({
  activeMenu,
  isOpen,
  onToggle,
  onMenuChange,
}: {
  activeMenu: MemberNav;
  isOpen: boolean;
  onToggle: () => void;
  onMenuChange: (menu: MemberNav) => void;
}) {
  return (
    <div className="relative mb-3.5 min-[1040px]:hidden">
      <div className="flex items-center justify-between rounded-lg bg-[#1f2937] px-4 py-3 text-[#e5edf7]">
        <strong className="text-base">개인 회원</strong>
        <button
          type="button"
          aria-label={isOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={isOpen}
          onClick={onToggle}
          className="rounded-[7px] p-2 text-[#e5edf7] transition-colors hover:bg-[#334155]"
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {isOpen ? (
        <>
          <button
            type="button"
            aria-label="메뉴 닫기"
            className="fixed inset-0 z-40 bg-black/40"
            onClick={onToggle}
          />
          <div className="absolute top-full right-0 left-0 z-50 mt-2 rounded-lg border border-[#334155] bg-[#1f2937] p-3.5 shadow-lg">
            <MemberNavList
              activeMenu={activeMenu}
              onMenuChange={(menu) => {
                onMenuChange(menu);
                onToggle();
              }}
            />
            <LogoutButton className="mt-3 w-full rounded-[7px] px-2.5 py-2.5 text-left text-[13px] text-[#cbd5e1] hover:bg-[#2b3648]" />
          </div>
        </>
      ) : null}
    </div>
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

function ProductAddDialog({
  open,
  onClose,
  onAdd,
  onSaveAndPreview,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (item: { product: string; qty: number; note: string }) => void;
  onSaveAndPreview: (item: { product: string; qty: number; note: string }) => void;
}) {
  const [product, setProduct] = useState("");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");

  const buildItem = () => ({
    product: product.trim(),
    qty: Number(qty) || 0,
    note: note.trim(),
  });

  const canSubmit = product.trim().length > 0 && Number(qty) > 0;

  const handleAdd = () => {
    if (!canSubmit) {
      return;
    }

    onAdd(buildItem());
    setProduct("");
    setQty("");
    setNote("");
  };

  const handleSaveAndPreview = () => {
    if (!canSubmit) {
      return;
    }

    onSaveAndPreview(buildItem());
    setProduct("");
    setQty("");
    setNote("");
  };

  return (
    <Dialog open={open} title="상품 입력" onClose={onClose}>
      <div className="space-y-4">
        <Input
          label="주문 제품명"
          value={product}
          onChange={(event) => setProduct(event.target.value)}
          placeholder="명진 1호"
        />
        <Input
          label="주문 수량"
          type="number"
          min={1}
          value={qty}
          onChange={(event) => setQty(event.target.value)}
          placeholder="300"
        />
        <div>
          <label htmlFor="product-note" className="mb-1.5 block text-xs text-[#475569]">
            요청 사항
          </label>
          <textarea
            id="product-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="개별택배 / 명함 동봉"
            className="min-h-[88px] w-full resize-none rounded-[7px] border border-[#cbd5e1] bg-[#f6f8fb] px-2.5 py-2 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <Button
          type="button"
          className="h-11 w-full rounded-full border-brand bg-brand text-white hover:bg-[#1856bf]"
          disabled={!canSubmit}
          onClick={handleAdd}
        >
          <Plus className="size-4" />
          상품 추가
        </Button>
        <Button
          type="button"
          className="h-11 w-full rounded-full border-[#16995f] bg-[#16995f] text-white hover:bg-[#128a52]"
          disabled={!canSubmit}
          onClick={handleSaveAndPreview}
        >
          저장 후 창 닫기
        </Button>
      </div>
    </Dialog>
  );
}

function ProductOrderPanel({
  onGreetingClick,
}: {
  onGreetingClick: () => void;
}) {
  const [orderType, setOrderType] = useState<OrderType>("delivery");
  const [productItems, setProductItems] = useState(INITIAL_PRODUCT_ITEMS);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [ordererName, setOrdererName] = useState("");
  const [ordererPhone, setOrdererPhone] = useState("");
  const isDesktop = useMinWidth(1040);
  const deliveryDateLabel =
    orderType === "delivery" ? "납기일(택배발송일)" : "납기일(배달완료일)";

  useEffect(() => {
    const auth = getAuthUser();
    if (!auth) {
      return;
    }

    if (auth.name) {
      setOrdererName(auth.name);
    }
    if (auth.phone) {
      setOrdererPhone(auth.phone);
    }

    let cancelled = false;

    const loadMemberProfile = async () => {
      try {
        const response = await fetch(
          `/api/auth/me?username=${encodeURIComponent(auth.username)}`,
        );
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as {
          user?: { name?: string; phone?: string; id?: number; role?: string };
        };

        if (cancelled || !data.user) {
          return;
        }

        if (data.user.name) {
          setOrdererName(data.user.name);
        }
        if (data.user.phone) {
          setOrdererPhone(data.user.phone);
        }

        saveAuthUser({
          ...auth,
          id: data.user.id ?? auth.id,
          name: data.user.name ?? auth.name,
          phone: data.user.phone ?? auth.phone,
        });
      } catch {
        // Keep session values when profile fetch fails.
      }
    };

    void loadMemberProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const addProductItem = (item: { product: string; qty: number; note: string }) => {
    setProductItems((current) => [
      ...current,
      {
        ...item,
        greeting: "제작대기",
      },
    ]);
  };

  const updateProductQty = (rowIndex: number, qty: number) => {
    setProductItems((current) =>
      current.map((item, index) =>
        index === rowIndex ? { ...item, qty: Math.max(1, qty) } : item,
      ),
    );
  };

  const productColumns: TableColumn<ProductLineItem>[] = [
    { key: "product", header: "상품명" },
    {
      key: "qty",
      header: "수량",
      className: "w-[72px] px-1 py-0",
      render: (row) => {
        const rowIndex = productItems.indexOf(row);
        if (rowIndex < 0) {
          return row.qty;
        }

        return (
          <input
            type="number"
            min={1}
            aria-label={`${row.product} 수량`}
            value={row.qty}
            onChange={(event) => {
              const nextQty = Number(event.target.value);
              if (!Number.isNaN(nextQty)) {
                updateProductQty(rowIndex, nextQty);
              }
            }}
            className="mx-auto block h-6 w-12 rounded border border-[#cbd5e1] bg-white px-1 text-center text-xs leading-none text-ink focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        );
      },
    },
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

  return (
    <Panel>
      <div className="mb-4 flex flex-col gap-3 min-[640px]:flex-row min-[640px]:items-start min-[640px]:justify-between">
        <h4 className="text-base font-semibold text-ink">신규 주문 작성</h4>
        <OrderTypeToggle value={orderType} onChange={setOrderType} compact />
      </div>

      <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
        <Input
          label="주문자 성명"
          value={ordererName}
          onChange={(event) => setOrdererName(event.target.value)}
          placeholder="주문자 성명"
        />
        <Input
          label="주문자 연락처"
          value={ordererPhone}
          onChange={(event) => setOrdererPhone(event.target.value)}
          placeholder="010-1234-5678"
        />
        <Input label="주문일자" type="date" defaultValue="2026-01-10" />
        <Input
          label={deliveryDateLabel}
          type="date"
          defaultValue="2026-01-16"
        />
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-2.5 xl:grid-cols-4">
        <Input label="거래처 담당자" defaultValue="홍길동" />
        <Input label="담당자 연락처" defaultValue="010-1234-5678" />
        <Input label="보내는 사람" defaultValue="이순희" />
        <Input label="보내는 연락처" defaultValue="010-1234-5678" />
      </div>

      <div className="mt-2.5">
        <label htmlFor="sender-address" className="mb-1.5 block text-xs text-[#475569]">
          보내는 주소
        </label>
        <div className="flex gap-2">
          <input
            id="sender-address"
            type="text"
            defaultValue="경기도 남양주시 기장신앙촌로 123"
            placeholder="주소를 입력하세요"
            className="min-h-9 w-full rounded-[7px] border border-[#cbd5e1] bg-white px-2.5 py-2 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
          <Button
            type="button"
            className="shrink-0 border-[#1f2937] bg-[#1f2937] px-4 text-white hover:bg-[#111827]"
          >
            주소 검색
          </Button>
        </div>
      </div>

      <div className="mt-3">
        <Table
          caption="제품 주문 상품 목록"
          columns={productColumns}
          data={productItems}
          scrollable={!isDesktop}
          visibleRows={isDesktop ? undefined : 4}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => setIsProductDialogOpen(true)}>
          상품 추가
        </Button>
        <Button
          className="border-brand bg-brand text-white hover:bg-[#1856bf]"
          onClick={onGreetingClick}
        >
          인사장 작성
        </Button>
        <Button className="border-green bg-green text-white hover:bg-[#128a52]">
          접수하기
        </Button>
      </div>

      <ProductAddDialog
        open={isProductDialogOpen}
        onClose={() => setIsProductDialogOpen(false)}
        onAdd={addProductItem}
        onSaveAndPreview={(item) => {
          addProductItem(item);
          setIsProductDialogOpen(false);
        }}
      />
    </Panel>
  );
}

function GreetingPanel({
  greetingTab,
  onGreetingTabChange,
}: {
  greetingTab: GreetingTab;
  onGreetingTabChange: (tab: GreetingTab) => void;
}) {
  return (
    <Panel>
      <GreetingForm greetingTab={greetingTab} onGreetingTabChange={onGreetingTabChange} />

      <div className="mt-3 flex flex-wrap gap-2">
        <Button className="border-brand bg-brand text-white hover:bg-[#1856bf]">
          인사장 저장
        </Button>
        <Button className="border-green bg-green text-white hover:bg-[#128a52]">
          인사장만 접수
        </Button>
      </div>
    </Panel>
  );
}

function OrderStatusPanel({
  orderColumns,
  orders,
}: {
  orderColumns: TableColumn<OrderRow>[];
  orders: OrderRow[];
}) {
  return (
    <Panel title="내 주문 현황">
      <Table caption="내 주문 현황" columns={orderColumns} data={orders} />
    </Panel>
  );
}

function ExcelPanel({ onUploadClick }: { onUploadClick: () => void }) {
  return (
    <Panel title="엑셀 업로드 / 다운로드">
      <p className="mb-4 text-sm text-muted-foreground">
        주문/인사장 데이터를 엑셀 파일로 업로드하거나 다운로드할 수 있습니다.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={onUploadClick}>
          엑셀 업로드
        </Button>
        <Button variant="outline">인사장 다운로드</Button>
        <Button variant="outline">주문마스터 다운로드</Button>
      </div>
    </Panel>
  );
}

export function OrderListInput({
  embedded = false,
}: {
  /** When true, renders only the order form content (no member sidebar shell). */
  embedded?: boolean;
} = {}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeMenu, setActiveMenu] = useState<MemberNav>("제품주문서");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [greetingTab, setGreetingTab] = useState<GreetingTab>("제품주문 연계");
  const [orders] = useState(INITIAL_ORDERS);

  const handleMenuChange = (menu: MemberNav) => {
    setActiveMenu(menu);
    setIsMobileMenuOpen(false);
  };

  const pageMeta = PAGE_META[activeMenu];

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

  const renderHeaderActions = () => {
    switch (activeMenu) {
      case "제품주문서":
        return null;
      case "인사장":
        return (
          <Button
            variant="outline"
            onClick={() => setGreetingTab("인사장만 의뢰")}
          >
            인사장만 의뢰 모드
          </Button>
        );
      case "내 주문 현황":
        return null;
      case "엑셀":
        return (
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            엑셀 업로드
          </Button>
        );
    }
  };

  const renderContent = () => {
    switch (activeMenu) {
      case "제품주문서":
        return (
          <ProductOrderPanel
            onGreetingClick={() => {
              setGreetingTab("제품주문 연계");
              handleMenuChange("인사장");
            }}
          />
        );
      case "인사장":
        return (
          <GreetingPanel
            greetingTab={greetingTab}
            onGreetingTabChange={setGreetingTab}
          />
        );
      case "내 주문 현황":
        return (
          <OrderStatusPanel orderColumns={orderColumns} orders={orders} />
        );
      case "엑셀":
        return (
          <ExcelPanel onUploadClick={() => fileInputRef.current?.click()} />
        );
    }
  };

  const content = (
    <>
      {!embedded ? (
        <div className="mb-3.5 flex flex-col gap-3 min-[1100px]:flex-row min-[1100px]:items-start min-[1100px]:justify-between">
          <div>
            <h3 className="text-[22px] font-semibold text-ink">{pageMeta.title}</h3>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {pageMeta.description}
            </p>
          </div>

          {renderHeaderActions() ? (
            <div className="flex flex-wrap gap-2">{renderHeaderActions()}</div>
          ) : null}
        </div>
      ) : null}

      <div className="w-full">{renderContent()}</div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
      />
    </>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="grid min-h-[730px] grid-cols-1 overflow-hidden rounded-[10px] border border-[#cbd3df] bg-white min-[1040px]:grid-cols-[200px_1fr]">
      <MemberSidebar activeMenu={activeMenu} onMenuChange={handleMenuChange} />

      <section className="bg-[#f7f9fc] p-4">
        <MobileMemberHeader
          activeMenu={activeMenu}
          isOpen={isMobileMenuOpen}
          onToggle={() => setIsMobileMenuOpen((open) => !open)}
          onMenuChange={handleMenuChange}
        />

        {content}
      </section>
    </div>
  );
}

export default OrderListInput;

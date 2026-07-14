"use client";

import { Menu, Plus, X } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { OrderDataMng } from "@/app/admin/OrderManagement/OrderDataMng";
import { OrderListInput } from "@/app/OrderManagement/OrderListInput";
import { OrderPrintPreview } from "@/app/admin/OrderManagement/OrderPrintPreview";
import { LogoutButton } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import { Table, type TableColumn } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const ADMIN_NAV = [
  "주문 목록",
  "주문 작성",
  "출력 관리",
  "데이터 관리",
  "기준정보",
] as const;

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "접수", label: "접수" },
  { value: "출력완료", label: "출력완료" },
  { value: "발송대기", label: "발송대기" },
  { value: "취소", label: "취소" },
] as const;

const MOBILE_STATUS_CHIPS = [
  { value: "접수", label: "접수" },
  { value: "발송대기", label: "발송대기" },
  { value: "출력완료", label: "출력완료" },
  { value: "취소", label: "취소" },
] as const;

type AdminNav = (typeof ADMIN_NAV)[number];
type StatusFilter = (typeof STATUS_FILTER_OPTIONS)[number]["value"];

interface AdminOrderRow {
  [key: string]: string | number;
  id: string;
  name: string;
  phone: string;
  type: string;
  status: string;
  productCount: number;
  summary: string;
  orderDate: string;
}

const ADMIN_ORDERS: AdminOrderRow[] = [
  {
    id: "ORD-0001",
    name: "이순희",
    phone: "010-1234-5678",
    type: "택배",
    status: "접수",
    productCount: 2,
    summary: "명진1호 300개 외 1건",
    orderDate: "2026-01-10",
  },
  {
    id: "ORD-0002",
    name: "김주문",
    phone: "010-2222-3333",
    type: "배달",
    status: "출력완료",
    productCount: 1,
    summary: "S5호 200개",
    orderDate: "2026-01-11",
  },
  {
    id: "ORD-0003",
    name: "박보내",
    phone: "010-3333-4444",
    type: "택배",
    status: "발송대기",
    productCount: 3,
    summary: "특선1호 120개 외 2건",
    orderDate: "2026-01-12",
  },
  {
    id: "ORD-0004",
    name: "최접수",
    phone: "010-4444-5555",
    type: "배달",
    status: "취소",
    productCount: 1,
    summary: "기쁨1호 50개",
    orderDate: "2026-01-13",
  },
  {
    id: "ORD-0005",
    name: "정주문",
    phone: "010-5555-6666",
    type: "택배",
    status: "접수",
    productCount: 2,
    summary: "명진1호 100개 외 1건",
    orderDate: "2026-01-15",
  },
  {
    id: "ORD-0006",
    name: "한배송",
    phone: "010-6666-7777",
    type: "배달",
    status: "발송대기",
    productCount: 4,
    summary: "S5호 80개 외 3건",
    orderDate: "2026-01-18",
  },
];

const dateInputClassName =
  "min-h-9 w-full rounded-[7px] border border-[#cbd5e1] bg-white px-2.5 py-2 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

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

function AdminNavList({
  activeMenu,
  onMenuChange,
}: {
  activeMenu: AdminNav;
  onMenuChange: (menu: AdminNav) => void;
}) {
  return (
    <nav className="space-y-1.5">
      {ADMIN_NAV.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onMenuChange(item)}
          className={cn(
            "block w-full rounded-[7px] border px-2.5 py-2.5 text-left text-[13px] transition-colors",
            activeMenu === item
              ? "border-[#334155] bg-[#334155] font-bold text-white"
              : "border-line bg-white text-ink hover:bg-soft",
          )}
        >
          {item}
        </button>
      ))}
    </nav>
  );
}

function AdminSidebar({
  activeMenu,
  onMenuChange,
}: {
  activeMenu: AdminNav;
  onMenuChange: (menu: AdminNav) => void;
}) {
  return (
    <aside className="hidden border-r border-line bg-white px-3.5 py-4 min-[1040px]:flex min-[1040px]:flex-col">
      <strong className="mb-4 block text-base text-ink">관리자</strong>
      <div className="flex-1">
        <AdminNavList activeMenu={activeMenu} onMenuChange={onMenuChange} />
      </div>
      <LogoutButton className="mt-4 w-full rounded-[7px] border border-line px-2.5 py-2 text-left text-[13px] text-[#64748b] hover:bg-soft" />
    </aside>
  );
}

function MobileAdminHeader({
  activeMenu,
  isOpen,
  onToggle,
  onMenuChange,
}: {
  activeMenu: AdminNav;
  isOpen: boolean;
  onToggle: () => void;
  onMenuChange: (menu: AdminNav) => void;
}) {
  return (
    <div className="relative mb-3 min-[1040px]:hidden">
      <div className="flex items-center justify-between rounded-lg bg-[#4b5563] px-4 py-3 text-white">
        <strong className="text-base">{activeMenu}</strong>
        <button
          type="button"
          aria-label={isOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={isOpen}
          onClick={onToggle}
          className="rounded-[7px] p-2 text-white transition-colors hover:bg-white/10"
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
          <div className="absolute top-full right-0 left-0 z-50 mt-2 rounded-lg border border-line bg-white p-3.5 shadow-lg">
            <AdminNavList
              activeMenu={activeMenu}
              onMenuChange={(menu) => {
                onMenuChange(menu);
                onToggle();
              }}
            />
            <LogoutButton className="mt-3 w-full rounded-[7px] border border-line px-2.5 py-2.5 text-left text-[13px] text-[#64748b] hover:bg-soft" />
          </div>
        </>
      ) : null}
    </div>
  );
}

function PeriodInputs({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  compact = false,
}: {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  compact?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs text-[#475569]">기간</label>
      <div className={cn("flex items-center gap-2", compact ? "min-h-9" : "min-h-9")}>
        <input
          type="date"
          value={startDate}
          onChange={(event) => onStartDateChange(event.target.value)}
          className={dateInputClassName}
        />
        <span className="shrink-0 text-sm text-[#64748b]">~</span>
        <input
          type="date"
          value={endDate}
          onChange={(event) => onEndDateChange(event.target.value)}
          className={dateInputClassName}
        />
      </div>
    </div>
  );
}

function DesktopFilterBar({
  startDate,
  endDate,
  status,
  keyword,
  onStartDateChange,
  onEndDateChange,
  onStatusChange,
  onKeywordChange,
}: {
  startDate: string;
  endDate: string;
  status: StatusFilter;
  keyword: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  onKeywordChange: (value: string) => void;
}) {
  return (
    <Panel>
      <div className="grid grid-cols-1 gap-2.5 min-[900px]:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.75fr)_minmax(0,1.3fr)]">
        <PeriodInputs
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={onStartDateChange}
          onEndDateChange={onEndDateChange}
        />

        <Dropdown
          label="상태"
          value={status}
          options={[...STATUS_FILTER_OPTIONS]}
          onChange={(value) => onStatusChange(value as StatusFilter)}
        />

        <Input
          label="검색어"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder="성명 / 연락처 / 주문번호"
        />
      </div>
    </Panel>
  );
}

function MobileOrderCard({ order }: { order: AdminOrderRow }) {
  return (
    <article className="flex items-center justify-between gap-3 rounded-xl border border-[#d8e0ea] bg-[#f8fafc] px-3.5 py-3">
      <div className="min-w-0">
        <p className="text-sm font-bold text-ink">{order.id}</p>
        <p className="mt-0.5 text-[15px] font-bold text-ink">
          {order.name} / {order.type}
        </p>
        <p className="mt-0.5 text-xs text-[#64748b]">{order.summary}</p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="shrink-0 border-[#93c5fd] bg-[#eff6ff] text-brand hover:bg-[#dbeafe]"
      >
        보기
      </Button>
    </article>
  );
}

function MobileOrderList({
  orders,
  startDate,
  endDate,
  status,
  keyword,
  onStartDateChange,
  onEndDateChange,
  onStatusChange,
  onKeywordChange,
  onNewOrder,
}: {
  orders: AdminOrderRow[];
  startDate: string;
  endDate: string;
  status: StatusFilter;
  keyword: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  onKeywordChange: (value: string) => void;
  onNewOrder: () => void;
}) {
  const toggleStatusChip = (chip: StatusFilter) => {
    onStatusChange(status === chip ? "all" : chip);
  };

  return (
    <div className="space-y-3 min-[1040px]:hidden">
      <div>
        <h3 className="mb-2.5 text-base font-bold text-ink">주문 검색</h3>

        <PeriodInputs
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={onStartDateChange}
          onEndDateChange={onEndDateChange}
          compact
        />

        <input
          type="search"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder="성명 / 연락처 / 주문번호"
          className="mt-2.5 min-h-10 w-full rounded-[10px] border border-[#cbd5e1] bg-[#f8fafc] px-3 py-2.5 text-sm text-ink placeholder:text-[#94a3b8] focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />

        <div className="mt-2.5 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={onNewOrder}
            className="inline-flex min-h-9 items-center justify-center gap-1 rounded-[10px] bg-[#334155] px-2 text-sm font-semibold text-white"
          >
            <Plus className="size-4" />
            신규
          </button>
          <button
            type="button"
            onClick={() => onStatusChange("all")}
            className={cn(
              "min-h-9 rounded-[10px] px-2 text-sm font-semibold text-white transition-colors",
              status === "all" ? "bg-[#1d4ed8]" : "bg-[#3b82f6]",
            )}
          >
            전체
          </button>
          {MOBILE_STATUS_CHIPS.map((chip) => {
            const isActive = status === chip.value;
            const colorClass =
              chip.value === "접수"
                ? isActive
                  ? "bg-[#2563eb]"
                  : "bg-[#3b82f6]"
                : chip.value === "발송대기"
                  ? isActive
                    ? "bg-[#475569]"
                    : "bg-[#64748b]"
                  : chip.value === "출력완료"
                    ? isActive
                      ? "bg-[#0f766e]"
                      : "bg-[#14b8a6]"
                    : isActive
                      ? "bg-[#b91c1c]"
                      : "bg-[#ef4444]";

            return (
              <button
                key={chip.value}
                type="button"
                onClick={() => toggleStatusChip(chip.value)}
                className={cn(
                  "min-h-9 rounded-[10px] px-2 text-sm font-semibold text-white transition-colors",
                  colorClass,
                )}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2.5">
        {orders.length === 0 ? (
          <p className="rounded-xl border border-line bg-white px-3.5 py-6 text-center text-sm text-muted-foreground">
            검색 결과가 없습니다.
          </p>
        ) : (
          orders.map((order) => <MobileOrderCard key={order.id} order={order} />)
        )}
      </div>
    </div>
  );
}

function filterOrders({
  orders,
  startDate,
  endDate,
  status,
  keyword,
}: {
  orders: AdminOrderRow[];
  startDate: string;
  endDate: string;
  status: StatusFilter;
  keyword: string;
}) {
  const normalizedKeyword = keyword.trim().toLowerCase();

  return orders.filter((order) => {
    const matchesStatus = status === "all" || order.status === status;
    const matchesDate =
      (!startDate || order.orderDate >= startDate) &&
      (!endDate || order.orderDate <= endDate);
    const matchesKeyword =
      normalizedKeyword.length === 0 ||
      order.id.toLowerCase().includes(normalizedKeyword) ||
      order.name.toLowerCase().includes(normalizedKeyword) ||
      order.phone.replaceAll("-", "").includes(normalizedKeyword.replaceAll("-", ""));

    return matchesStatus && matchesDate && matchesKeyword;
  });
}

export function OrderListMng() {
  const [activeMenu, setActiveMenu] = useState<AdminNav>("주문 목록");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-01-31");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [keyword, setKeyword] = useState("");

  const filteredOrders = useMemo(
    () =>
      filterOrders({
        orders: ADMIN_ORDERS,
        startDate,
        endDate,
        status: statusFilter,
        keyword,
      }),
    [startDate, endDate, statusFilter, keyword],
  );

  const orderColumns: TableColumn<AdminOrderRow>[] = [
    { key: "id", header: "주문번호" },
    { key: "name", header: "성명" },
    { key: "type", header: "구분" },
    { key: "status", header: "상태" },
    {
      key: "productCount",
      header: "상품",
      render: (row) => `${row.productCount}건`,
    },
    {
      key: "action",
      header: "작업",
      render: (row) => (
        <Button variant="outline" size="sm">
          {row.status === "접수" ? "출력" : "보기"}
        </Button>
      ),
    },
  ];

  const handleMenuChange = (menu: AdminNav) => {
    setActiveMenu(menu);
    setIsMobileMenuOpen(false);
  };

  const handleNewOrder = () => {
    handleMenuChange("주문 작성");
  };

  const renderContent = () => {
    if (activeMenu === "주문 목록") {
      return (
        <>
          <MobileOrderList
            orders={filteredOrders}
            startDate={startDate}
            endDate={endDate}
            status={statusFilter}
            keyword={keyword}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onStatusChange={setStatusFilter}
            onKeywordChange={setKeyword}
            onNewOrder={handleNewOrder}
          />

          <div className="hidden space-y-3 min-[1040px]:block">
            <DesktopFilterBar
              startDate={startDate}
              endDate={endDate}
              status={statusFilter}
              keyword={keyword}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onStatusChange={setStatusFilter}
              onKeywordChange={setKeyword}
            />

            <Panel>
              <Table
                caption="관리자 주문 목록"
                columns={orderColumns}
                data={filteredOrders}
              />
            </Panel>
          </div>
        </>
      );
    }

    if (activeMenu === "주문 작성") {
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-semibold text-ink min-[1040px]:text-[22px]">
                주문 작성
              </h3>
              <p className="mt-1 text-[13px] text-muted-foreground">
                관리자가 회원 주문을 대신 작성합니다.
              </p>
            </div>
            <Button variant="outline" onClick={() => handleMenuChange("주문 목록")}>
              목록으로
            </Button>
          </div>
          <OrderListInput embedded />
        </div>
      );
    }

    if (activeMenu === "출력 관리") {
      return <OrderPrintPreview />;
    }

    if (activeMenu === "데이터 관리") {
      return <OrderDataMng />;
    }

    return (
      <Panel>
        <p className="text-sm text-muted-foreground">
          {activeMenu} 화면은 준비 중입니다.
        </p>
      </Panel>
    );
  };

  return (
    <div className="grid min-h-[730px] grid-cols-1 overflow-hidden rounded-[10px] border border-[#cbd3df] bg-white min-[1040px]:grid-cols-[200px_1fr]">
      <AdminSidebar activeMenu={activeMenu} onMenuChange={handleMenuChange} />

      <section className="bg-[#f7f9fc] p-4">
        <MobileAdminHeader
          activeMenu={activeMenu}
          isOpen={isMobileMenuOpen}
          onToggle={() => setIsMobileMenuOpen((open) => !open)}
          onMenuChange={handleMenuChange}
        />

        {activeMenu === "주문 목록" ? (
          <div className="mb-3.5 hidden items-center justify-between gap-3 min-[1040px]:flex">
            <h3 className="text-[22px] font-semibold text-ink">주문 관리</h3>
            <Button
              className="border-brand bg-brand text-white hover:bg-[#1856bf]"
              onClick={handleNewOrder}
            >
              <Plus className="size-4" />
              신규 주문
            </Button>
          </div>
        ) : null}

        {renderContent()}
      </section>
    </div>
  );
}

export default OrderListMng;

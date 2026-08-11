"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { ProductNameWithStock } from "@/components/product-name-with-stock";
import { ProductPickDialog } from "@/components/product-pick-dialog";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

type PaymentType = "선불" | "착불";
type ConvertPhase = "idle" | "converting" | "ready";

const DOWNLOAD_FILENAME = "우체국택배_업로드_컨버트.xlsx";

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
    <section
      className={cn(
        "min-w-0 rounded-lg border border-line bg-panel p-3.5",
        className,
      )}
    >
      {title ? (
        <h4 className="mb-2.5 text-base font-semibold text-ink">{title}</h4>
      ) : null}
      {children}
    </section>
  );
}

function fieldClassName() {
  return "min-h-9 w-full rounded-[7px] border border-[#cbd5e1] bg-white px-2.5 py-2 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";
}

function ConvertProgress({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="mt-4 flex flex-col items-center gap-3 rounded-lg border border-line bg-[#0b1b33] px-4 py-5">
      <p className="text-base font-semibold text-white">변환중</p>
      <div className="relative flex size-[120px] items-center justify-center">
        <svg
          className="size-full -rotate-90"
          viewBox="0 0 100 100"
          aria-hidden
        >
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#000000"
            strokeWidth="10"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#2f80ed"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-300 ease-out"
          />
        </svg>
        <span className="absolute text-xl font-bold text-white">{clamped}%</span>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/images/convert-spinner.png"
        alt=""
        className="size-10 animate-spin"
        style={{ animationDuration: "0.85s" }}
      />
      <p className="text-sm font-medium text-white/80">Progressbar</p>
    </div>
  );
}

/** Admin tool: convert holiday-gift recipient xlsx → Korea Post upload xls. */
export function AdminPostOfficeUploadMng() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const downloadUrlRef = useRef<string | null>(null);
  const [boxUnit, setBoxUnit] = useState("5");
  const [paymentType, setPaymentType] = useState<PaymentType>("선불");
  const [productName, setProductName] = useState("");
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<ConvertPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (downloadUrlRef.current) {
        URL.revokeObjectURL(downloadUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (phase !== "converting") {
      return;
    }

    setProgress(8);
    const timer = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 90) {
          return current;
        }
        return current + Math.max(1, Math.round((90 - current) * 0.08));
      });
    }, 200);

    return () => {
      window.clearInterval(timer);
    };
  }, [phase]);

  const clearDownloadUrl = () => {
    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current);
      downloadUrlRef.current = null;
    }
  };

  const validateOptions = () => {
    const unit = Number(boxUnit);
    if (!Number.isFinite(unit) || unit <= 0) {
      setError("박스단위는 1 이상의 숫자로 입력해 주세요.");
      return false;
    }
    if (!productName.trim()) {
      setError("상품명을 검색하여 선택해 주세요.");
      return false;
    }
    return true;
  };

  const handleUploadClick = () => {
    setError("");
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    clearDownloadUrl();
    setSelectedFile(file);
    setPhase("idle");
    setProgress(0);
    setError("");
  };

  const handleConvert = async () => {
    if (phase === "converting") {
      return;
    }

    if (!validateOptions()) {
      return;
    }

    if (!selectedFile) {
      setError("명절선물_입력.xlsx 파일을 먼저 선택해 주세요.");
      return;
    }

    clearDownloadUrl();
    setPhase("converting");
    setProgress(8);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("boxUnit", String(Number(boxUnit)));
      formData.append("paymentType", paymentType);
      formData.append("productName", productName.trim());

      const response = await apiFetch(
        "/api/post-office/holiday-gift-convert",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        let message = "엑셀 변환에 실패했습니다.";
        try {
          const data = (await response.json()) as {
            message?: string | string[];
          };
          if (Array.isArray(data.message)) {
            message = data.message.join(", ");
          } else if (typeof data.message === "string" && data.message) {
            message = data.message;
          }
        } catch {
          // non-JSON error body
        }
        setPhase("idle");
        setProgress(0);
        setError(message);
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      downloadUrlRef.current = url;
      setProgress(100);
      setPhase("ready");
    } catch {
      setPhase("idle");
      setProgress(0);
      setError("엑셀 변환에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  const handleDownload = () => {
    if (!downloadUrlRef.current) {
      setError("다운로드할 변환 파일이 없습니다. 다시 변환해 주세요.");
      return;
    }

    const link = document.createElement("a");
    link.href = downloadUrlRef.current;
    link.download = DOWNLOAD_FILENAME;
    link.click();
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold text-ink min-[1040px]:text-[22px]">
          우체국택배 업로드용
        </h3>
        <p className="mt-1 text-[13px] text-muted-foreground">
          명절선물 수취인 리스트를 우체국택배 업로드 양식(.xlsx)으로 변환합니다.
        </p>
      </div>

      <Panel title="명절선물수취인 리스트 업로드">
        <p className="mb-4 text-sm text-muted-foreground">
          옵션을 선택한 뒤 명절선물_입력.xlsx 파일을 선택하고, 변환 버튼을
          누르면 우체국택배_업로드_컨버트.xlsx를 내려받을 수 있습니다.
        </p>

        <div className="mb-4 space-y-3 rounded-md border border-line bg-[#f8fafc] p-3">
          <div className="grid gap-3 min-[640px]:grid-cols-[140px_1fr] min-[640px]:items-center">
            <label
              htmlFor="post-office-box-unit"
              className="text-sm font-medium text-ink"
            >
              1. 박스단위
            </label>
            <input
              id="post-office-box-unit"
              type="number"
              min={1}
              step={1}
              value={boxUnit}
              onChange={(event) => setBoxUnit(event.target.value)}
              className={cn(fieldClassName(), "max-w-[160px]")}
            />
          </div>

          <div className="grid gap-3 min-[640px]:grid-cols-[140px_1fr] min-[640px]:items-center">
            <span className="text-sm font-medium text-ink">2. 선/착</span>
            <div className="flex flex-wrap gap-4 text-sm text-ink">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="post-office-payment"
                  value="선불"
                  checked={paymentType === "선불"}
                  onChange={() => setPaymentType("선불")}
                />
                선불
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="post-office-payment"
                  value="착불"
                  checked={paymentType === "착불"}
                  onChange={() => setPaymentType("착불")}
                />
                착불
              </label>
            </div>
          </div>

          <div className="grid gap-3 min-[640px]:grid-cols-[140px_1fr] min-[640px]:items-center">
            <label
              htmlFor="post-office-product-name"
              className="text-sm font-medium text-ink"
            >
              3. 상품명
            </label>
            <div className="flex min-w-0 flex-wrap gap-2">
              <input
                id="post-office-product-name"
                type="text"
                readOnly
                value={productName}
                placeholder="상품명 검색으로 선택"
                className={cn(fieldClassName(), "min-w-0 flex-1")}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsProductDialogOpen(true)}
              >
                상품명 검색
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={phase === "converting"}
            onClick={handleUploadClick}
          >
            명절선물수취인 리스트업로드
          </Button>
          <Button
            type="button"
            disabled={phase === "converting" || !selectedFile}
            onClick={() => void handleConvert()}
          >
            변환
          </Button>
          {selectedFile ? (
            <span className="text-sm text-muted-foreground">
              선택 파일: {selectedFile.name}
            </span>
          ) : null}
        </div>

        {phase === "converting" ? (
          <div className="mt-4">
            <ConvertProgress percent={progress} />
          </div>
        ) : null}

        {phase === "ready" ? (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-ink">변환이 완료되었습니다.</p>
            <Button type="button" onClick={handleDownload}>
              변환된 파일 다운로드
            </Button>
          </div>
        ) : null}

        {error ? <p className="mt-3 text-sm text-red">{error}</p> : null}
      </Panel>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleFileChange}
      />

      <ProductPickDialog
        open={isProductDialogOpen}
        onClose={() => setIsProductDialogOpen(false)}
        onSelect={(name) => {
          setProductName(name);
          setError("");
        }}
      />
    </div>
  );
}

export default AdminPostOfficeUploadMng;

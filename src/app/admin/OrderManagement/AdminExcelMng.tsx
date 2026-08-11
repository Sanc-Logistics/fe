"use client";

import { useRef, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

const UPLOAD_TEMPLATE_URL = "/templates/order-bulk-upload.xlsx";

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

type BulkImportResult = {
  requested: number;
  created: number;
  skipped: number;
  failed: number;
  createdOrderNumbers?: string[];
  skippedOrderNumbers?: string[];
  failures?: Array<{ orderNumber?: string; reason: string }>;
  message?: string;
};

/** Admin excel upload/download for bulk order (and greeting) records. */
export function AdminExcelMng() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const [error, setError] = useState("");

  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = UPLOAD_TEMPLATE_URL;
    link.download = "주문_일괄등록_양식.xlsx";
    link.click();
  };

  const handleUploadClick = () => {
    setError("");
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || isUploading) {
      return;
    }

    setIsUploading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("skipExisting", "true");

      const response = await apiFetch("/api/orders/bulk-import", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as BulkImportResult;

      if (!response.ok) {
        setError(data.message || "엑셀 업로드에 실패했습니다.");
        return;
      }

      setResult(data);
    } catch {
      setError("엑셀 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold text-ink min-[1040px]:text-[22px]">
          엑셀
        </h3>
        <p className="mt-1 text-[13px] text-muted-foreground">
          엑셀로 여러 건의 주문을 한 번에 등록하거나, 주문/인사장 데이터를
          내려받습니다.
        </p>
      </div>

      <Panel title="엑셀 업로드 / 다운로드">
        <p className="mb-4 text-sm text-muted-foreground">
          주문 일괄등록 양식을 내려받아 작성한 뒤 업로드하세요. 회원은
          연락처로 매칭됩니다.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleDownloadTemplate}
          >
            주문 업로드 양식 다운로드
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
            onClick={handleUploadClick}
          >
            {isUploading ? "업로드 중..." : "엑셀 업로드"}
          </Button>
        </div>

        {error ? <p className="mt-3 text-sm text-red">{error}</p> : null}

        {result ? (
          <div className="mt-3 space-y-1.5 rounded-md border border-line bg-[#f8fafc] p-3 text-sm text-ink">
            <p>
              요청 {result.requested}건 · 등록 {result.created}건 · 건너뜀{" "}
              {result.skipped}건 · 실패 {result.failed}건
            </p>
            {result.failures && result.failures.length > 0 ? (
              <ul className="list-disc space-y-0.5 pl-5 text-muted-foreground">
                {result.failures.slice(0, 8).map((failure, index) => (
                  <li key={`${failure.orderNumber ?? "row"}-${index}`}>
                    {failure.orderNumber
                      ? `${failure.orderNumber}: ${failure.reason}`
                      : failure.reason}
                  </li>
                ))}
                {result.failures.length > 8 ? (
                  <li>외 {result.failures.length - 8}건…</li>
                ) : null}
              </ul>
            ) : null}
          </div>
        ) : null}
      </Panel>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={(event) => void handleFileChange(event)}
      />
    </div>
  );
}

export default AdminExcelMng;

import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#e9edf3] px-4">
      <div className="w-full max-w-md rounded-[10px] border border-[#cbd3df] bg-white p-6 shadow-[0_14px_34px_rgba(18,38,63,0.08)]">
        <h1 className="text-xl font-semibold text-ink">물류부 주문 관리 시스템</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          로그인 또는 API 문서(Swagger)로 이동하세요.
        </p>

        <div className="mt-5 flex flex-col gap-2">
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-[7px] bg-brand px-4 text-sm font-semibold text-white hover:bg-[#1856bf]"
          >
            로그인
          </Link>
          <Link
            href="/swagger"
            className="inline-flex h-11 items-center justify-center rounded-[7px] border border-[#1f2937] bg-[#1f2937] px-4 text-sm font-semibold text-white hover:bg-[#111827]"
          >
            Swagger API Docs
          </Link>
          <Link
            href="/api"
            className="inline-flex h-11 items-center justify-center rounded-[7px] border border-line bg-white px-4 text-sm font-semibold text-ink hover:bg-soft"
          >
            API Status (/api)
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function SwaggerPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-[#e5eaf0] bg-[#f8fafc] px-4 py-3">
        <h1 className="text-lg font-semibold text-ink">SANC Logistics API Docs</h1>
        <p className="text-xs text-[#64748b]">
          OpenAPI 스펙: <code>/api/openapi</code> · Swagger UI: <code>/swagger</code>
        </p>
      </div>

      <iframe
        title="Swagger UI"
        src="/api-docs/index.html"
        className="h-[calc(100vh-72px)] w-full border-0"
      />
    </main>
  );
}

export default function SwaggerPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-[#e5eaf0] bg-[#f8fafc] px-4 py-3">
        <h1 className="text-base font-semibold text-ink">SANC Logistics API Docs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          OpenAPI / Swagger UI
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

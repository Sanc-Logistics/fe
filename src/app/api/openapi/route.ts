import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

// GET /api/openapi — serves the OpenAPI JSON from project root
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "openapi.json");
    const raw = await readFile(filePath, "utf8");
    const spec = JSON.parse(raw);

    return NextResponse.json(spec, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to load openapi.json:", error);
    return NextResponse.json(
      { message: "OpenAPI spec를 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}

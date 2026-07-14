import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { normalizeUsername } from "@/lib/member-auth";

// GET /api/members/check-username?username=leesh01
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = normalizeUsername(searchParams.get("username") ?? "");

  if (!username) {
    return NextResponse.json(
      { available: false, message: "아이디를 입력해 주세요." },
      { status: 400 },
    );
  }

  if (!/^[a-z0-9]{4,20}$/.test(username)) {
    return NextResponse.json(
      {
        available: false,
        message: "아이디는 영문 소문자와 숫자 4~20자로 입력해 주세요.",
      },
      { status: 400 },
    );
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json({
        available: false,
        message: "이미 사용 중인 아이디입니다.",
      });
    }

    return NextResponse.json({
      available: true,
      message: "사용 가능한 아이디입니다.",
    });
  } catch (error) {
    console.error("check-username failed:", error);
    return NextResponse.json(
      {
        available: false,
        message: "아이디 중복 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      },
      { status: 500 },
    );
  }
}

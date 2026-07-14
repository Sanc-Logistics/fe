import { NextResponse } from "next/server";

import { normalizeUsername } from "@/lib/member-auth";
import { prisma } from "@/lib/prisma";

// GET /api/auth/me?username=tenorseon
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = normalizeUsername(searchParams.get("username") ?? "");

    if (!username) {
      return NextResponse.json(
        { message: "아이디가 필요합니다." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        fullname: true,
        phone: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "회원 정보를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        name: user.fullname,
        phone: user.phone,
        email: user.email,
        role: user.role === "ADMIN" ? "admin" : "member",
      },
    });
  } catch (error) {
    console.error("auth/me failed:", error);
    return NextResponse.json(
      { message: "회원 정보를 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}

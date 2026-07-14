import { NextResponse } from "next/server";

import { hashPassword, normalizeUsername } from "@/lib/member-auth";
import { prisma } from "@/lib/prisma";

type LoginBody = {
  username?: string;
  password?: string;
};

// POST /api/auth/login
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody;
    const username = normalizeUsername(body.username ?? "");
    const password = body.password ?? "";

    if (!username || !password) {
      return NextResponse.json(
        { message: "아이디와 비밀번호를 입력해 주세요." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        password: true,
        fullname: true,
        phone: true,
        role: true,
      },
    });

    if (!user || user.password !== hashPassword(password)) {
      return NextResponse.json(
        { message: "아이디 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 },
      );
    }

    return NextResponse.json({
      message: "로그인되었습니다.",
      user: {
        id: user.id,
        username: user.username,
        name: user.fullname,
        phone: user.phone,
        role: user.role === "ADMIN" ? "admin" : "member",
      },
    });
  } catch (error) {
    console.error("login failed:", error);
    return NextResponse.json(
      { message: "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}

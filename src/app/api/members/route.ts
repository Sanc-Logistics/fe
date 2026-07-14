import { NextResponse } from "next/server";

import {
  formatPhone,
  hashPassword,
  normalizePhone,
  normalizeUsername,
} from "@/lib/member-auth";
import { prisma } from "@/lib/prisma";

type SignupBody = {
  fullname?: string;
  username?: string;
  phone?: string;
  email?: string;
  password?: string;
};

function validateSignup(body: SignupBody) {
  const errors: Record<string, string> = {};

  const fullname = body.fullname?.trim() ?? "";
  const username = normalizeUsername(body.username ?? "");
  const phone = normalizePhone(body.phone ?? "");
  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";

  if (!fullname) {
    errors.fullname = "이름을 입력해 주세요.";
  } else if (fullname.length < 2) {
    errors.fullname = "이름은 2자 이상 입력해 주세요.";
  }

  if (!username) {
    errors.username = "아이디를 입력해 주세요.";
  } else if (!/^[a-z0-9]{4,20}$/.test(username)) {
    errors.username = "아이디는 영문 소문자와 숫자 4~20자로 입력해 주세요.";
  }

  if (!phone) {
    errors.phone = "연락처를 입력해 주세요.";
  } else if (!/^01[016789]\d{8}$/.test(phone)) {
    errors.phone = "연락처는 010-1234-5678 형식으로 입력해 주세요.";
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "올바른 이메일 형식이 아닙니다.";
  }

  if (!password) {
    errors.password = "비밀번호를 입력해 주세요.";
  } else if (password.length < 4) {
    errors.password = "비밀번호는 4자 이상 입력해 주세요.";
  }

  return {
    errors,
    values: {
      fullname,
      username,
      phone: formatPhone(phone),
      email: email || null,
      password,
    },
  };
}

// POST /api/members
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignupBody;
    const { errors, values } = validateSignup(body);

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { message: "입력값을 확인해 주세요.", errors },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({
      where: { username: values.username },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        {
          message: "이미 사용 중인 아이디입니다.",
          errors: { username: "이미 사용 중인 아이디입니다." },
        },
        { status: 409 },
      );
    }

    const user = await prisma.user.create({
      data: {
        fullname: values.fullname,
        username: values.username,
        phone: values.phone,
        email: values.email,
        password: hashPassword(values.password),
        role: "MEMBER",
      },
      select: {
        id: true,
        username: true,
        fullname: true,
        phone: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "회원가입이 완료되었습니다.",
        user,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("signup failed:", error);
    return NextResponse.json(
      { message: "회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}

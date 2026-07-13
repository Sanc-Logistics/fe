"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  authenticate,
  getAuthUser,
  getHomePathForRole,
  saveAuthUser,
} from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const existing = getAuthUser();
    if (existing) {
      router.replace(getHomePathForRole(existing.role));
    }
  }, [router]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const user = authenticate(username, password);

    if (!user) {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
      setIsSubmitting(false);
      return;
    }

    saveAuthUser(user);
    router.push(getHomePathForRole(user.role));
  };

  return (
    <main className="relative min-h-screen bg-[#e9edf3] px-6 pb-12 pt-[86px] md:pt-[96px] lg:pt-[120px]">
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 rounded-[10px] border border-[#cbd3df] bg-white px-6 py-8 shadow-[0_14px_34px_rgba(18,38,63,0.08)]">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-ink">물류부 주문 관리 시스템</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            관리자 또는 개인회원 계정으로 로그인하세요.
          </p>
        </div>

        <form className="flex w-full flex-col gap-5" noValidate onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-sm font-medium text-[#475569]">
              아이디
            </label>
            <Input
              id="username"
              type="text"
              placeholder="아이디를 입력해 주세요"
              className="w-full"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium text-[#475569]">
              비밀번호
            </label>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호를 입력해 주세요"
              className="w-full"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {error ? (
            <p className="rounded-[7px] border border-red/30 bg-[#fff0ed] px-3 py-2 text-sm text-red">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="default"
            disabled={!username || !password || isSubmitting}
            className="h-12 w-full border-brand bg-brand text-white hover:bg-[#1856bf] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "로그인 중..." : "로그인"}
          </Button>
        </form>

        <div className="w-full rounded-[7px] border border-line bg-[#f8fafc] px-3 py-3 text-xs text-[#64748b]">
          <p className="font-semibold text-ink">임시 계정 (API 연동 전)</p>
          <p className="mt-1">관리자: admin / admin</p>
          <p className="mt-2 font-semibold text-ink">개인회원 (아이디 = 비밀번호)</p>
          <ul className="mt-1 space-y-0.5">
            <li>이순희 — leesh01</li>
            <li>김주문 — kimjm02</li>
            <li>박보내 — parkbn03</li>
            <li>최접수 — choijs04</li>
            <li>정주문 — jungjm05</li>
            <li>한배송 — hanbs06</li>
          </ul>
        </div>

        <p className="text-center text-xs text-[#64748b]">
          개인회원이시면 아래 가입하기 버튼을 클릭하여 가입해 주세요.{" "}
          <Link
            href="/signup"
            className="font-semibold text-[#F97B22] underline underline-offset-2"
          >
            가입하기
          </Link>
        </p>
      </div>
    </main>
  );
}

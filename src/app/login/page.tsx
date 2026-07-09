"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    return (
        <main className="relative min-h-screen bg-white px-6 pb-12 pt-[86px] md:pt-[96px] lg:pt-[120px]">
   
          <div className="mx-auto flex flex-col items-center gap-6">
            <h1 className="text_2xl_semibold black_black_500_t">로그인</h1>
    
            <form className="flex flex-col gap-6" noValidate>
              <div className="flex flex-col gap-2">
                <label htmlFor="username" className="text_lg_medium black_black_400_t">
                  이메일
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="이메일을 입력해 주세요"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary focus:ring-primary"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
    
              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text_lg_medium black_black_400_t">
                  비밀번호
                </label>
                <Input
                  id="password"
                  placeholder="비밀번호를 입력해 주세요"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary focus:ring-primary"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
    
              <Button
                type="submit"
                variant="default"
                disabled={!username || !password}
                className="h-[54px] w-full md:h-[64px] disabled:cursor-not-allowed disabled:opacity-60"
              >
                로그인
              </Button>
            </form>
    
            <p className="text-center text_xs_regular gray_gray_500_t">
              기업담당자이신가요?{" "}
              <Link
                href="/signup/super-admin"
                className="text_xs_semibold text-[#F97B22] underline underline-offset-2"
              >
                가입하기
              </Link>
            </p>
          </div>
        </main>
      )
    }
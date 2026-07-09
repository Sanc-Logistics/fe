'use client';

import { useState } from 'react';

import { Input } from './input';
import { PasswordInput } from './password-input';

export interface LoginFormProps {
  onSubmit?: (values: { email: string; password: string }) => void;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <form
      className="w-full max-w-sm space-y-3 rounded-xl border border-line bg-panel p-5 shadow-[0_14px_34px_rgba(18,38,63,0.08)]"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.({ email, password });
      }}
    >
      <div>
        <h2 className="text-lg font-semibold text-ink">로그인</h2>
        <p className="text-sm text-muted">Sanc Logistics 계정으로 접속하세요.</p>
      </div>
      <Input
        label="이메일"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="name@example.com"
      />
      <PasswordInput
        label="비밀번호"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="••••••••"
      />
      <button
        type="submit"
        className="min-h-9 w-full rounded-[7px] border border-brand bg-brand px-3 text-sm font-semibold text-white hover:bg-[#1856bf]"
      >
        로그인
      </button>
    </form>
  );
}

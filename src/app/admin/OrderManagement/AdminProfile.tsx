"use client";

import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { getAccessToken, getAuthUser, normalizeUserRole, saveAuthUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

type ProfileUser = {
  id: number;
  username: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  role: string;
};

function formatPhoneInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) {
    return digits;
  }
  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export function AdminProfilePanel() {
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const loadProfile = async () => {
    setIsLoading(true);
    setError("");

    try {
      if (!getAccessToken()) {
        setError("로그인이 필요합니다.");
        setProfile(null);
        return;
      }

      const response = await apiFetch("/api/auth/me");
      const data = (await response.json()) as {
        message?: string;
        user?: ProfileUser;
      };

      if (!response.ok || !data.user) {
        setError(data.message ?? "회원 정보를 불러오지 못했습니다.");
        setProfile(null);
        return;
      }

      setProfile(data.user);
      setFullname(data.user.name ?? "");
      setPhone(data.user.phone ?? "");
      setEmail(data.user.email ?? "");
      setPassword("");
      setPasswordConfirm("");

      const auth = getAuthUser();
      if (auth) {
        saveAuthUser(
          {
            ...auth,
            id: data.user.id,
            name: data.user.name,
            phone: data.user.phone ?? undefined,
          },
          getAccessToken() ?? undefined,
        );
      }
    } catch {
      setError("회원 정보를 불러오지 못했습니다.");
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const startEdit = () => {
    if (!profile) {
      return;
    }
    setFullname(profile.name ?? "");
    setPhone(profile.phone ?? "");
    setEmail(profile.email ?? "");
    setPassword("");
    setPasswordConfirm("");
    setError("");
    setSuccess("");
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setError("");
    setSuccess("");
    if (profile) {
      setFullname(profile.name ?? "");
      setPhone(profile.phone ?? "");
      setEmail(profile.email ?? "");
      setPassword("");
      setPasswordConfirm("");
    }
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!profile || isSaving) {
      return;
    }

    setError("");
    setSuccess("");

    if (fullname.trim().length < 2) {
      setError("이름은 2자 이상 입력해 주세요.");
      return;
    }

    const phoneDigits = phone.replace(/\D/g, "");
    if (!/^01[016789]\d{8}$/.test(phoneDigits)) {
      setError("연락처는 010-1234-5678 형식으로 입력해 주세요.");
      return;
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("올바른 이메일 형식이 아닙니다.");
      return;
    }

    if (password) {
      if (password.length < 4) {
        setError("비밀번호는 4자 이상 입력해 주세요.");
        return;
      }
      if (password !== passwordConfirm) {
        setError("비밀번호 확인이 일치하지 않습니다.");
        return;
      }
    }

    setIsSaving(true);

    try {
      const body: {
        fullname: string;
        phone: string;
        email: string | null;
        password?: string;
      } = {
        fullname: fullname.trim(),
        phone: formatPhoneInput(phone),
        email: email.trim() || null,
      };

      if (password) {
        body.password = password;
      }

      const response = await apiFetch(`/api/members/${profile.id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });

      const data = (await response.json()) as {
        message?: string;
        user?: {
          id: number;
          username: string;
          fullname: string;
          phone: string;
          email: string | null;
          role: string;
        };
      };

      if (!response.ok || !data.user) {
        setError(data.message ?? "프로필 저장에 실패했습니다.");
        return;
      }

      const nextProfile: ProfileUser = {
        id: data.user.id,
        username: data.user.username,
        name: data.user.fullname,
        phone: data.user.phone,
        email: data.user.email,
        role: normalizeUserRole(data.user.role),
      };

      setProfile(nextProfile);
      setIsEditing(false);
      setPassword("");
      setPasswordConfirm("");
      setSuccess(data.message ?? "프로필이 저장되었습니다.");

      const auth = getAuthUser();
      if (auth) {
        saveAuthUser(
          {
            ...auth,
            id: nextProfile.id,
            name: nextProfile.name,
            phone: nextProfile.phone ?? undefined,
          },
          getAccessToken() ?? undefined,
        );
      }
    } catch {
      setError("프로필 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <section className="rounded-lg border border-line bg-panel p-4">
        <p className="text-sm text-muted-foreground">프로필을 불러오는 중...</p>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="rounded-lg border border-line bg-panel p-4">
        <p className="text-sm text-red">{error || "프로필을 찾을 수 없습니다."}</p>
        <Button type="button" variant="outline" className="mt-3" onClick={() => void loadProfile()}>
          다시 시도
        </Button>
      </section>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-ink min-[1040px]:text-[22px]">
            관리자 프로필
          </h3>
          <p className="mt-1 text-[13px] text-muted-foreground">
            계정 정보를 확인하고 연락처·비밀번호를 수정할 수 있습니다.
          </p>
        </div>
        {!isEditing ? (
          <Button
            type="button"
            className="border-brand bg-brand text-white hover:bg-[#1856bf]"
            onClick={startEdit}
          >
            프로필 수정
          </Button>
        ) : null}
      </div>

      <section className="rounded-lg border border-line bg-panel p-4">
        {error ? (
          <p className="mb-3 rounded-[7px] border border-red/30 bg-[#fff0ed] px-3 py-2 text-sm text-red">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="mb-3 rounded-[7px] border border-green/30 bg-[#e8f8ef] px-3 py-2 text-sm text-green">
            {success}
          </p>
        ) : null}

        {!isEditing ? (
          <dl className="grid gap-3 min-[640px]:grid-cols-2">
            <div>
              <dt className="text-xs text-[#64748b]">아이디</dt>
              <dd className="mt-1 text-sm font-medium text-ink">{profile.username}</dd>
            </div>
            <div>
              <dt className="text-xs text-[#64748b]">권한</dt>
              <dd className="mt-1 text-sm font-medium text-ink">
                {profile.role === "admin" || profile.role === "ADMIN"
                  ? "관리자"
                  : profile.role === "factory" || profile.role === "FACTORY"
                    ? "공장"
                    : "회원"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[#64748b]">이름</dt>
              <dd className="mt-1 text-sm font-medium text-ink">{profile.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-[#64748b]">연락처</dt>
              <dd className="mt-1 text-sm font-medium text-ink">
                {profile.phone || "-"}
              </dd>
            </div>
            <div className="min-[640px]:col-span-2">
              <dt className="text-xs text-[#64748b]">이메일</dt>
              <dd className="mt-1 text-sm font-medium text-ink">
                {profile.email || "-"}
              </dd>
            </div>
          </dl>
        ) : (
          <form className="space-y-3" onSubmit={(event) => void handleSave(event)}>
            <div className="grid gap-3 min-[640px]:grid-cols-2">
              <Input label="아이디" value={profile.username} disabled />
              <Input
                label="권한"
                value={
                  profile.role === "admin" || profile.role === "ADMIN"
                    ? "관리자"
                    : profile.role === "factory" || profile.role === "FACTORY"
                      ? "공장"
                      : "회원"
                }
                disabled
              />
              <Input
                label="이름"
                value={fullname}
                onChange={(event) => setFullname(event.target.value)}
                required
              />
              <Input
                label="연락처"
                value={phone}
                onChange={(event) => setPhone(formatPhoneInput(event.target.value))}
                placeholder="010-1234-5678"
                required
              />
              <div className="min-[640px]:col-span-2">
                <Input
                  label="이메일"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="선택 입력"
                />
              </div>
              <Input
                label="새 비밀번호"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="변경 시에만 입력"
                autoComplete="new-password"
              />
              <Input
                label="새 비밀번호 확인"
                type="password"
                value={passwordConfirm}
                onChange={(event) => setPasswordConfirm(event.target.value)}
                placeholder="변경 시에만 입력"
                autoComplete="new-password"
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                type="submit"
                className="border-green bg-green text-white hover:bg-[#128a52]"
                disabled={isSaving}
              >
                {isSaving ? "저장 중..." : "저장"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={cancelEdit}
              >
                취소
              </Button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

export function AdminSettingsButton({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="관리자 프로필"
      title="관리자 프로필"
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-[7px] border border-transparent text-[#64748b] transition-colors hover:border-line hover:bg-soft hover:text-ink",
        className,
      )}
    >
      <Image
        src="/assets/icons/settings.png"
        alt=""
        width={18}
        height={18}
        className="size-[18px] object-contain"
      />
    </button>
  );
}

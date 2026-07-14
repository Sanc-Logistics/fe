"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerLocalMember } from "@/lib/auth";
import { cn } from "@/lib/utils";

type FieldErrors = Partial<
  Record<"fullname" | "username" | "phone" | "email" | "password" | "passwordConfirm", string>
>;

type UsernameCheckStatus = "idle" | "checking" | "available" | "unavailable" | "error";

/** Force contact input into 000-0000-0000 (3-4-4 digits only). */
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

function validateClientForm(values: {
  fullname: string;
  username: string;
  phone: string;
  email: string;
  password: string;
  passwordConfirm: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  const username = values.username.trim().toLowerCase();

  if (!values.fullname.trim()) {
    errors.fullname = "이름을 입력해 주세요.";
  } else if (values.fullname.trim().length < 2) {
    errors.fullname = "이름은 2자 이상 입력해 주세요.";
  }

  if (!username) {
    errors.username = "아이디를 입력해 주세요.";
  } else if (!/^[a-z0-9]{4,20}$/.test(username)) {
    errors.username = "아이디는 영문 소문자와 숫자 4~20자로 입력해 주세요.";
  }

  if (!values.phone.trim()) {
    errors.phone = "연락처를 입력해 주세요.";
  } else if (!/^01[016789]-\d{4}-\d{4}$/.test(values.phone)) {
    errors.phone = "연락처는 010-1234-5678 형식으로 입력해 주세요.";
  }

  if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "올바른 이메일 형식이 아닙니다.";
  }

  if (!values.password) {
    errors.password = "비밀번호를 입력해 주세요.";
  } else if (values.password.length < 4) {
    errors.password = "비밀번호는 4자 이상 입력해 주세요.";
  }

  if (!values.passwordConfirm) {
    errors.passwordConfirm = "비밀번호 확인을 입력해 주세요.";
  } else if (values.password !== values.passwordConfirm) {
    errors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
  }

  return errors;
}

export default function MemberSignupPage() {
  const router = useRouter();
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameCheck, setUsernameCheck] = useState<{
    status: UsernameCheckStatus;
    message: string;
    checkedValue: string;
  }>({
    status: "idle",
    message: "",
    checkedValue: "",
  });
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [isPhoneVerifying, setIsPhoneVerifying] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [isEmailVerifying, setIsEmailVerifying] = useState(false);

  const normalizedUsername = username.trim().toLowerCase();
  const normalizedEmail = email.trim();
  const isValidEmailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
  const isPhoneVerified =
    phoneVerified && verifiedPhone === phone && /^01[016789]-\d{4}-\d{4}$/.test(phone);
  const isEmailVerified =
    normalizedEmail.length === 0 ||
    (emailVerified && verifiedEmail === normalizedEmail && isValidEmailFormat);

  const canSubmit = useMemo(() => {
    return (
      fullname.trim().length > 0 &&
      username.trim().length > 0 &&
      isPhoneVerified &&
      isEmailVerified &&
      password.length > 0 &&
      passwordConfirm.length > 0 &&
      usernameCheck.status === "available" &&
      usernameCheck.checkedValue === normalizedUsername
    );
  }, [
    fullname,
    username,
    isPhoneVerified,
    isEmailVerified,
    password,
    passwordConfirm,
    usernameCheck,
    normalizedUsername,
  ]);

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setUsernameCheck({
      status: "idle",
      message: "",
      checkedValue: "",
    });
    setErrors((current) => ({ ...current, username: undefined }));
  };

  const handlePhoneChange = (value: string) => {
    const nextPhone = formatPhoneInput(value);
    setPhone(nextPhone);
    if (phoneVerified && nextPhone !== verifiedPhone) {
      setPhoneVerified(false);
      setVerifiedPhone("");
    }
    setErrors((current) => ({ ...current, phone: undefined }));
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailVerified && value.trim() !== verifiedEmail) {
      setEmailVerified(false);
      setVerifiedEmail("");
    }
    setErrors((current) => ({ ...current, email: undefined }));
  };

  const handleVerifyPhone = async () => {
    if (!/^01[016789]-\d{4}-\d{4}$/.test(phone)) {
      setErrors((current) => ({
        ...current,
        phone: "연락처는 010-1234-5678 형식으로 입력해 주세요.",
      }));
      setPhoneVerified(false);
      setVerifiedPhone("");
      return;
    }

    setIsPhoneVerifying(true);
    setErrors((current) => ({ ...current, phone: undefined }));

    // Temporary mock verification until SMS API is connected.
    await new Promise((resolve) => window.setTimeout(resolve, 500));

    setPhoneVerified(true);
    setVerifiedPhone(phone);
    setIsPhoneVerifying(false);
  };

  const handleVerifyEmail = async () => {
    if (!normalizedEmail) {
      setErrors((current) => ({
        ...current,
        email: "이메일을 입력해 주세요.",
      }));
      setEmailVerified(false);
      setVerifiedEmail("");
      return;
    }

    if (!isValidEmailFormat) {
      setErrors((current) => ({
        ...current,
        email: "올바른 이메일 형식이 아닙니다.",
      }));
      setEmailVerified(false);
      setVerifiedEmail("");
      return;
    }

    setIsEmailVerifying(true);
    setErrors((current) => ({ ...current, email: undefined }));

    // Temporary mock verification until email API is connected.
    await new Promise((resolve) => window.setTimeout(resolve, 500));

    setEmailVerified(true);
    setVerifiedEmail(normalizedEmail);
    setIsEmailVerifying(false);
  };

  const handleCheckUsername = async () => {
    const nextUsername = username.trim().toLowerCase();

    if (!nextUsername) {
      setErrors((current) => ({
        ...current,
        username: "아이디를 입력해 주세요.",
      }));
      return;
    }

    if (!/^[a-z0-9]{4,20}$/.test(nextUsername)) {
      setErrors((current) => ({
        ...current,
        username: "아이디는 영문 소문자와 숫자 4~20자로 입력해 주세요.",
      }));
      setUsernameCheck({
        status: "unavailable",
        message: "아이디는 영문 소문자와 숫자 4~20자로 입력해 주세요.",
        checkedValue: nextUsername,
      });
      return;
    }

    setUsernameCheck({
      status: "checking",
      message: "중복 확인 중...",
      checkedValue: nextUsername,
    });

    try {
      const response = await fetch(
        `/api/members/check-username?username=${encodeURIComponent(nextUsername)}`,
      );
      const data = (await response.json()) as {
        available?: boolean;
        message?: string;
      };

      if (!response.ok) {
        setUsernameCheck({
          status: "error",
          message: data.message ?? "아이디 중복 확인에 실패했습니다.",
          checkedValue: nextUsername,
        });
        return;
      }

      setUsernameCheck({
        status: data.available ? "available" : "unavailable",
        message: data.message ?? "",
        checkedValue: nextUsername,
      });

      if (!data.available) {
        setErrors((current) => ({
          ...current,
          username: data.message ?? "이미 사용 중인 아이디입니다.",
        }));
      } else {
        setErrors((current) => ({ ...current, username: undefined }));
      }
    } catch {
      setUsernameCheck({
        status: "error",
        message: "아이디 중복 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.",
        checkedValue: nextUsername,
      });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const nextErrors = validateClientForm({
      fullname,
      username,
      phone,
      email,
      password,
      passwordConfirm,
    });

    if (
      usernameCheck.status !== "available" ||
      usernameCheck.checkedValue !== normalizedUsername
    ) {
      nextErrors.username = "아이디 중복 확인을 진행해 주세요.";
    }

    if (!isPhoneVerified) {
      nextErrors.phone = "휴대폰 인증을 완료해 주세요.";
    }

    if (normalizedEmail && !isEmailVerified) {
      nextErrors.email = "이메일 인증을 완료해 주세요.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname: fullname.trim(),
          username: normalizedUsername,
          phone: phone.trim(),
          email: email.trim() || undefined,
          password,
        }),
      });

      const data = (await response.json()) as {
        message?: string;
        errors?: FieldErrors;
        user?: { username: string; fullname: string };
      };

      if (!response.ok) {
        setErrors(data.errors ?? {});
        setFormError(data.message ?? "회원가입에 실패했습니다.");

        if (data.errors?.username) {
          setUsernameCheck({
            status: "unavailable",
            message: data.errors.username,
            checkedValue: normalizedUsername,
          });
        }

        return;
      }

      registerLocalMember({
        username: normalizedUsername,
        password,
        name: fullname.trim(),
        phone: phone.trim(),
      });

      router.push("/login?signup=success");
    } catch {
      setFormError("회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#e9edf3] px-4 py-8 min-[745px]:px-6 min-[745px]:py-10">
      <div className="mx-auto w-full max-w-lg rounded-[10px] border border-[#cbd3df] bg-white px-5 py-7 shadow-[0_14px_34px_rgba(18,38,63,0.08)] min-[745px]:px-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-ink">소비조합원 가입</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            주문 접수에 필요한 회원 정보를 등록해 주세요.
          </p>
        </div>

        <form className="space-y-4" noValidate onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="mb-1.5 block text-xs text-[#475569]">
              아이디 (필수)
            </label>
            <div className="flex gap-2">
              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => handleUsernameChange(event.target.value)}
                placeholder="영문/숫자 4~20자"
                autoComplete="username"
                className={cn(
                  "min-h-9 w-full rounded-[7px] border border-[#cbd5e1] bg-white px-2.5 py-2 text-sm text-ink",
                  "placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20",
                  errors.username ? "border-red" : "",
                )}
                aria-invalid={errors.username ? true : undefined}
              />
              <Button
                type="button"
                variant="outline"
                className="shrink-0"
                onClick={handleCheckUsername}
                disabled={usernameCheck.status === "checking"}
              >
                {usernameCheck.status === "checking" ? "확인 중" : "중복확인"}
              </Button>
            </div>
            {errors.username ? (
              <p className="mt-1 text-xs text-red">{errors.username}</p>
            ) : usernameCheck.message ? (
              <p
                className={cn(
                  "mt-1 text-xs",
                  usernameCheck.status === "available"
                    ? "text-green"
                    : usernameCheck.status === "checking"
                      ? "text-[#64748b]"
                      : "text-red",
                )}
              >
                {usernameCheck.message}
              </p>
            ) : (
              <p className="mt-1 text-xs text-[#64748b]">
                영문 소문자와 숫자만 사용 가능합니다.
              </p>
            )}
          </div>

          <Input
            id="fullname"
            label="이름 (필수)"
            value={fullname}
            onChange={(event) => {
              setFullname(event.target.value);
              setErrors((current) => ({ ...current, fullname: undefined }));
            }}
            placeholder="홍길동"
            autoComplete="name"
            error={errors.fullname}
          />

          <div>
            <label htmlFor="phone" className="mb-1.5 block text-xs text-[#475569]">
              연락처 (필수)
            </label>
            <div className="flex gap-2">
              <input
                id="phone"
                type="text"
                value={phone}
                onChange={(event) => handlePhoneChange(event.target.value)}
                placeholder="010-1234-5678"
                autoComplete="tel"
                inputMode="numeric"
                maxLength={13}
                pattern="01[016789]-[0-9]{4}-[0-9]{4}"
                className={cn(
                  "min-h-9 w-full rounded-[7px] border border-[#cbd5e1] bg-white px-2.5 py-2 text-sm text-ink",
                  "placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20",
                  errors.phone ? "border-red" : "",
                )}
                aria-invalid={errors.phone ? true : undefined}
              />
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "shrink-0",
                  isPhoneVerified &&
                    "border-green bg-[#e8f8ef] text-green hover:bg-[#e8f8ef]",
                )}
                onClick={handleVerifyPhone}
                disabled={isPhoneVerifying || isPhoneVerified}
              >
                {isPhoneVerifying
                  ? "인증 중"
                  : isPhoneVerified
                    ? "휴대폰인증✔"
                    : "휴대폰인증"}
              </Button>
            </div>
            {errors.phone ? (
              <p className="mt-1 text-xs text-red">{errors.phone}</p>
            ) : isPhoneVerified ? (
              <p className="mt-1 text-xs text-green">휴대폰 인증이 완료되었습니다.</p>
            ) : (
              <p className="mt-1 text-xs text-[#64748b]">
                010-1234-5678 형식으로 입력 후 인증해 주세요.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs text-[#475569]">
              이메일 (선택):권장사항-신앙촌 제품 뉴스레터 발송
            </label>
            <div className="flex gap-2">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => handleEmailChange(event.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                className={cn(
                  "min-h-9 w-full rounded-[7px] border border-[#cbd5e1] bg-white px-2.5 py-2 text-sm text-ink",
                  "placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20",
                  errors.email ? "border-red" : "",
                )}
                aria-invalid={errors.email ? true : undefined}
              />
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "shrink-0",
                  emailVerified &&
                    verifiedEmail === normalizedEmail &&
                    "border-green bg-[#e8f8ef] text-green hover:bg-[#e8f8ef]",
                )}
                onClick={handleVerifyEmail}
                disabled={
                  isEmailVerifying ||
                  (emailVerified && verifiedEmail === normalizedEmail) ||
                  !normalizedEmail
                }
              >
                {isEmailVerifying
                  ? "인증 중"
                  : emailVerified && verifiedEmail === normalizedEmail
                    ? "이메일인증✔"
                    : "이메일인증"}
              </Button>
            </div>
            {errors.email ? (
              <p className="mt-1 text-xs text-red">{errors.email}</p>
            ) : emailVerified && verifiedEmail === normalizedEmail ? (
              <p className="mt-1 text-xs text-green">이메일 인증이 완료되었습니다.</p>
            ) : (
              <p className="mt-1 text-xs text-[#64748b]">
                이메일을 입력한 경우 인증을 완료해 주세요. (미입력 시 생략 가능)
              </p>
            )}
          </div>

          <Input
            id="password"
            label="비밀번호 (필수)"
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrors((current) => ({ ...current, password: undefined }));
            }}
            placeholder="4자 이상 입력"
            autoComplete="new-password"
            error={errors.password}
          />

          <Input
            id="passwordConfirm"
            label="비밀번호 확인 (필수)"
            type="password"
            value={passwordConfirm}
            onChange={(event) => {
              setPasswordConfirm(event.target.value);
              setErrors((current) => ({
                ...current,
                passwordConfirm: undefined,
              }));
            }}
            placeholder="비밀번호를 다시 입력"
            autoComplete="new-password"
            error={errors.passwordConfirm}
          />

          {formError ? (
            <p className="rounded-[7px] border border-red/30 bg-[#fff0ed] px-3 py-2 text-sm text-red">
              {formError}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="h-12 w-full border-brand bg-brand text-white hover:bg-[#1856bf] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "가입 처리 중..." : "회원가입"}
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-[#64748b]">
          이미 계정이 있으신가요?{" "}
          <Link
            href="/login"
            className="font-semibold text-brand underline underline-offset-2"
          >
            로그인
          </Link>
        </p>
      </div>
    </main>
  );
}

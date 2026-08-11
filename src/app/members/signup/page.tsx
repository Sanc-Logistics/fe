"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { API_BASE_URL } from "@/lib/env";
import { cn } from "@/lib/utils";

type FieldErrors = Partial<
  Record<
    "fullname" | "church" | "phone" | "email" | "password" | "passwordConfirm",
    string
  >
>;

type PhoneCheckStatus = "idle" | "checking" | "available" | "unavailable" | "error";

type EmailCheckStatus = "idle" | "checking" | "available" | "error";

type ChurchOption = {
  id: number;
  name: string;
  region: string;
  branchCode: string | null;
  assigner: string;
};

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

function phoneToUsername(phone: string) {
  return phone.replace(/\D/g, "");
}

function validateClientForm(values: {
  fullname: string;
  churchId: number | null;
  phone: string;
  email: string;
  password: string;
  passwordConfirm: string;
}): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.fullname.trim()) {
    errors.fullname = "이름을 입력해 주세요.";
  } else if (values.fullname.trim().length < 2) {
    errors.fullname = "이름은 2자 이상 입력해 주세요.";
  }

  if (!values.churchId) {
    errors.church = "중앙을 선택해 주세요.";
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

function ChurchSearchField({
  churches,
  isLoading,
  query,
  selectedId,
  error,
  onQueryChange,
  onSelect,
}: {
  churches: ChurchOption[];
  isLoading: boolean;
  query: string;
  selectedId: number | null;
  error?: string;
  onQueryChange: (value: string) => void;
  onSelect: (church: ChurchOption) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) {
      return churches.slice(0, 20);
    }
    return churches
      .filter((church) => {
        const haystack = [
          church.name,
          church.region,
          church.branchCode ?? "",
          church.assigner,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(keyword);
      })
      .slice(0, 30);
  }, [churches, query]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <label htmlFor="church" className="mb-1.5 block text-2xl font-bold text-ink">
        중앙 (필수)
      </label>
      <input
        id="church"
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls="church-suggestions"
        aria-autocomplete="list"
        value={query}
        onChange={(event) => {
          onQueryChange(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="예: 5, 서울, 원주"
        autoComplete="off"
        className={cn(
          "min-h-9 w-full rounded-[7px] border border-[#cbd5e1] bg-white px-2.5 py-2 text-lg text-ink",
          "placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20",
          error ? "border-red" : "",
        )}
        aria-invalid={error ? true : undefined}
      />
      {isOpen ? (
        <ul
          id="church-suggestions"
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-[7px] border border-line bg-white shadow-lg"
        >
          {isLoading ? (
            <li className="px-3 py-2.5 text-sm text-[#64748b]">중앙 목록 불러오는 중...</li>
          ) : filtered.length === 0 ? (
            <li className="px-3 py-2.5 text-sm text-[#64748b]">검색 결과가 없습니다.</li>
          ) : (
            filtered.map((church) => {
              const selected = selectedId === church.id;
              return (
                <li key={church.id} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-left hover:bg-[#eff6ff]",
                      selected ? "bg-[#eff6ff]" : "bg-white",
                    )}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      onSelect(church);
                      setIsOpen(false);
                    }}
                  >
                    <span className="text-sm font-semibold text-ink">{church.name}</span>
                    <span className="text-xs text-[#64748b]">
                      {church.region}
                      {church.branchCode ? ` · ${church.branchCode}` : ""}
                      {church.assigner ? ` · ${church.assigner}` : ""}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      ) : null}
      {error ? (
        <p className="mt-1 text-xs text-red">{error}</p>
      ) : selectedId ? (
        <p className="mt-1 text-2xl text-green">중앙이 선택되었습니다.</p>
      ) : (
        <p className="mt-1 text-xs text-[#64748b]">
          키워드를 입력해 중앙을 검색한 뒤 목록에서 선택해 주세요.
        </p>
      )}
    </div>
  );
}

export default function MemberSignupPage() {
  const router = useRouter();
  const [fullname, setFullname] = useState("");
  const [churchQuery, setChurchQuery] = useState("");
  const [churchId, setChurchId] = useState<number | null>(null);
  const [churches, setChurches] = useState<ChurchOption[]>([]);
  const [isChurchesLoading, setIsChurchesLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneCheck, setPhoneCheck] = useState<{
    status: PhoneCheckStatus;
    message: string;
    checkedValue: string;
  }>({
    status: "idle",
    message: "",
    checkedValue: "",
  });
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [smsSent, setSmsSent] = useState(false);
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [isPhoneVerifying, setIsPhoneVerifying] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isEmailVerifying, setIsEmailVerifying] = useState(false);
  const [emailCheck, setEmailCheck] = useState<{
    status: EmailCheckStatus;
    message: string;
  }>({
    status: "idle",
    message: "",
  });

  const usernameFromPhone = phoneToUsername(phone);
  const normalizedEmail = email.trim();
  const isValidEmailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
  const isPhoneVerified =
    phoneVerified && verifiedPhone === phone && /^01[016789]-\d{4}-\d{4}$/.test(phone);
  const isPhoneAvailable =
    phoneCheck.status === "available" && phoneCheck.checkedValue === usernameFromPhone;
  const isEmailVerified =
    normalizedEmail.length === 0 ||
    (emailVerified && verifiedEmail === normalizedEmail && isValidEmailFormat);

  useEffect(() => {
    let cancelled = false;

    const loadChurches = async () => {
      setIsChurchesLoading(true);
      try {
        const response = await apiFetch("/api/churches");
        const data = (await response.json()) as ChurchOption[] | { message?: string };
        if (!response.ok || !Array.isArray(data) || cancelled) {
          return;
        }
        setChurches(data);
      } catch {
        // Leave empty; user will see no results until retry/refresh.
      } finally {
        if (!cancelled) {
          setIsChurchesLoading(false);
        }
      }
    };

    void loadChurches();
    return () => {
      cancelled = true;
    };
  }, []);

  const canSubmit = useMemo(() => {
    return (
      fullname.trim().length > 0 &&
      churchId != null &&
      isPhoneVerified &&
      isPhoneAvailable &&
      isEmailVerified &&
      password.length > 0 &&
      passwordConfirm.length > 0
    );
  }, [
    fullname,
    churchId,
    isPhoneVerified,
    isPhoneAvailable,
    isEmailVerified,
    password,
    passwordConfirm,
  ]);

  const handleChurchQueryChange = (value: string) => {
    setChurchQuery(value);
    setChurchId(null);
    setErrors((current) => ({ ...current, church: undefined }));
  };

  const handleChurchSelect = (church: ChurchOption) => {
    setChurchQuery(church.name);
    setChurchId(church.id);
    setErrors((current) => ({ ...current, church: undefined }));
  };

  const handlePhoneChange = (value: string) => {
    const nextPhone = formatPhoneInput(value);
    setPhone(nextPhone);
    if (phoneVerified && nextPhone !== verifiedPhone) {
      setPhoneVerified(false);
      setVerifiedPhone("");
    }
    if (smsSent || smsCode) {
      setSmsSent(false);
      setSmsCode("");
    }
    setPhoneCheck({
      status: "idle",
      message: "",
      checkedValue: "",
    });
    setErrors((current) => ({ ...current, phone: undefined }));
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailVerified && value.trim() !== verifiedEmail) {
      setEmailVerified(false);
      setVerifiedEmail("");
    }
    if (emailSent || emailCode) {
      setEmailSent(false);
      setEmailCode("");
    }
    setEmailCheck({ status: "idle", message: "" });
    setErrors((current) => ({ ...current, email: undefined }));
  };

  const handleSendSmsCode = async () => {
    if (!/^01[016789]-\d{4}-\d{4}$/.test(phone)) {
      setErrors((current) => ({
        ...current,
        phone: "연락처는 010-1234-5678 형식으로 입력해 주세요.",
      }));
      setPhoneVerified(false);
      setVerifiedPhone("");
      setSmsSent(false);
      setSmsCode("");
      setPhoneCheck({ status: "idle", message: "", checkedValue: "" });
      return;
    }

    setIsSendingSms(true);
    setErrors((current) => ({ ...current, phone: undefined }));
    setPhoneVerified(false);
    setVerifiedPhone("");
    setPhoneCheck({ status: "idle", message: "", checkedValue: "" });

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/sms/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setSmsSent(false);
        setSmsCode("");
        setErrors((current) => ({
          ...current,
          phone: data.message ?? "인증번호 발송에 실패했습니다.",
        }));
        return;
      }

      setSmsSent(true);
      setSmsCode("");
      setPhoneCheck({
        status: "checking",
        message: data.message ?? "인증번호가 발송되었습니다.",
        checkedValue: "",
      });
    } catch {
      setSmsSent(false);
      setSmsCode("");
      setErrors((current) => ({
        ...current,
        phone: "인증번호 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      }));
    } finally {
      setIsSendingSms(false);
    }
  };

  const handleVerifySmsCode = async () => {
    if (!/^01[016789]-\d{4}-\d{4}$/.test(phone)) {
      setErrors((current) => ({
        ...current,
        phone: "연락처는 010-1234-5678 형식으로 입력해 주세요.",
      }));
      return;
    }

    if (!/^\d{6}$/.test(smsCode)) {
      setErrors((current) => ({
        ...current,
        phone: "6자리 인증번호를 입력해 주세요.",
      }));
      return;
    }

    const nextUsername = phoneToUsername(phone);
    setIsPhoneVerifying(true);
    setErrors((current) => ({ ...current, phone: undefined }));

    try {
      const verifyResponse = await fetch(`${API_BASE_URL}/api/auth/sms/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: smsCode }),
      });
      const verifyData = (await verifyResponse.json()) as {
        verified?: boolean;
        message?: string;
      };

      if (!verifyResponse.ok || !verifyData.verified) {
        setPhoneVerified(false);
        setVerifiedPhone("");
        setPhoneCheck({
          status: "error",
          message: verifyData.message ?? "인증번호 확인에 실패했습니다.",
          checkedValue: "",
        });
        setErrors((current) => ({
          ...current,
          phone: verifyData.message ?? "인증번호 확인에 실패했습니다.",
        }));
        return;
      }

      setPhoneCheck({
        status: "checking",
        message: "연락처 중복 확인 중...",
        checkedValue: nextUsername,
      });

      const response = await fetch(
        `${API_BASE_URL}/api/members/check-username?username=${encodeURIComponent(nextUsername)}`,
      );
      const data = (await response.json()) as {
        available?: boolean;
        message?: string;
      };

      if (!response.ok) {
        setPhoneVerified(false);
        setVerifiedPhone("");
        setPhoneCheck({
          status: "error",
          message: data.message ?? "연락처 중복 확인에 실패했습니다.",
          checkedValue: nextUsername,
        });
        setErrors((current) => ({
          ...current,
          phone: data.message ?? "연락처 중복 확인에 실패했습니다.",
        }));
        return;
      }

      if (!data.available) {
        setPhoneVerified(false);
        setVerifiedPhone("");
        setPhoneCheck({
          status: "unavailable",
          message: "이미 가입된 연락처입니다.",
          checkedValue: nextUsername,
        });
        setErrors((current) => ({
          ...current,
          phone: "이미 가입된 연락처입니다.",
        }));
        return;
      }

      setPhoneVerified(true);
      setVerifiedPhone(phone);
      setPhoneCheck({
        status: "available",
        message: "사용 가능한 연락처입니다. (로그인 아이디로 사용됩니다)",
        checkedValue: nextUsername,
      });
    } catch {
      setPhoneVerified(false);
      setVerifiedPhone("");
      setPhoneCheck({
        status: "error",
        message: "연락처 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.",
        checkedValue: nextUsername,
      });
      setErrors((current) => ({
        ...current,
        phone: "연락처 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      }));
    } finally {
      setIsPhoneVerifying(false);
    }
  };

  const handleSendEmailCode = async () => {
    if (!normalizedEmail) {
      setErrors((current) => ({
        ...current,
        email: "이메일을 입력해 주세요.",
      }));
      setEmailVerified(false);
      setVerifiedEmail("");
      setEmailSent(false);
      setEmailCode("");
      setEmailCheck({ status: "idle", message: "" });
      return;
    }

    if (!isValidEmailFormat) {
      setErrors((current) => ({
        ...current,
        email: "올바른 이메일 형식이 아닙니다.",
      }));
      setEmailVerified(false);
      setVerifiedEmail("");
      setEmailSent(false);
      setEmailCode("");
      setEmailCheck({ status: "idle", message: "" });
      return;
    }

    setIsSendingEmail(true);
    setErrors((current) => ({ ...current, email: undefined }));
    setEmailVerified(false);
    setVerifiedEmail("");
    setEmailCheck({ status: "idle", message: "" });

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/email/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setEmailSent(false);
        setEmailCode("");
        setErrors((current) => ({
          ...current,
          email: data.message ?? "인증번호 발송에 실패했습니다.",
        }));
        return;
      }

      setEmailSent(true);
      setEmailCode("");
      setEmailCheck({
        status: "checking",
        message: data.message ?? "이메일로 인증번호가 발송되었습니다.",
      });
    } catch {
      setEmailSent(false);
      setEmailCode("");
      setErrors((current) => ({
        ...current,
        email: "인증번호 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      }));
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleVerifyEmailCode = async () => {
    if (!normalizedEmail) {
      setErrors((current) => ({
        ...current,
        email: "이메일을 입력해 주세요.",
      }));
      return;
    }

    if (!isValidEmailFormat) {
      setErrors((current) => ({
        ...current,
        email: "올바른 이메일 형식이 아닙니다.",
      }));
      return;
    }

    if (!/^\d{6}$/.test(emailCode)) {
      setErrors((current) => ({
        ...current,
        email: "6자리 인증번호를 입력해 주세요.",
      }));
      return;
    }

    setIsEmailVerifying(true);
    setErrors((current) => ({ ...current, email: undefined }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/email/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, code: emailCode }),
      });
      const data = (await response.json()) as {
        verified?: boolean;
        message?: string;
      };

      if (!response.ok || !data.verified) {
        setEmailVerified(false);
        setVerifiedEmail("");
        setEmailCheck({
          status: "error",
          message: data.message ?? "인증번호 확인에 실패했습니다.",
        });
        setErrors((current) => ({
          ...current,
          email: data.message ?? "인증번호 확인에 실패했습니다.",
        }));
        return;
      }

      setEmailVerified(true);
      setVerifiedEmail(normalizedEmail);
      setEmailCheck({
        status: "available",
        message: data.message ?? "이메일 인증이 완료되었습니다.",
      });
    } catch {
      setEmailVerified(false);
      setVerifiedEmail("");
      setEmailCheck({
        status: "error",
        message: "이메일 인증에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      });
      setErrors((current) => ({
        ...current,
        email: "이메일 인증에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      }));
    } finally {
      setIsEmailVerifying(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const nextErrors = validateClientForm({
      fullname,
      churchId,
      phone,
      email,
      password,
      passwordConfirm,
    });

    if (!isPhoneVerified) {
      nextErrors.phone = "휴대폰 인증을 완료해 주세요.";
    } else if (!isPhoneAvailable) {
      nextErrors.phone = "연락처 중복 확인을 완료해 주세요.";
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
      const response = await fetch(`${API_BASE_URL}/api/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname: fullname.trim(),
          username: usernameFromPhone,
          phone: phone.trim(),
          email: email.trim() || undefined,
          password,
          churchId,
        }),
      });

      const data = (await response.json()) as {
        message?: string;
        errors?: FieldErrors & { username?: string; churchId?: string };
        user?: { username: string; fullname: string };
      };

      if (!response.ok) {
        const serverErrors: FieldErrors = { ...(data.errors ?? {}) };
        if (data.errors?.username) {
          serverErrors.phone =
            data.errors.username === "이미 사용 중인 아이디입니다."
              ? "이미 가입된 연락처입니다."
              : data.errors.username;
          setPhoneCheck({
            status: "unavailable",
            message: serverErrors.phone ?? "이미 가입된 연락처입니다.",
            checkedValue: usernameFromPhone,
          });
          setPhoneVerified(false);
          setVerifiedPhone("");
        }
        if (data.errors?.churchId) {
          serverErrors.church = data.errors.churchId;
        }

        setErrors(serverErrors);
        setFormError(data.message ?? "회원가입에 실패했습니다.");
        return;
      }

      router.push("/login?signup=success");
    } catch {
      setFormError("회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#e9edf3] px-4 py-8 min-[745px]:px-6 min-[745px]:py-10">
      <div className="mx-auto w-full max-w-2xl rounded-[10px] border border-[#cbd3df] bg-white px-5 py-7 shadow-[0_14px_34px_rgba(18,38,63,0.08)] min-[745px]:px-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-ink">소비조합원 가입</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            주문 접수에 필요한 회원 정보를 등록해 주세요.
          </p>
        </div>

        <form className="space-y-4" noValidate onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2">
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

            <ChurchSearchField
              churches={churches}
              isLoading={isChurchesLoading}
              query={churchQuery}
              selectedId={churchId}
              error={errors.church}
              onQueryChange={handleChurchQueryChange}
              onSelect={handleChurchSelect}
            />
          </div>

          <div>
            <label htmlFor="phone" className="mb-1.5 block text-2xl font-bold text-ink">
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
                  "min-h-9 w-full rounded-[7px] border border-[#cbd5e1] bg-white px-2.5 py-2 text-lg text-ink",
                  "placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20",
                  errors.phone ? "border-red" : "",
                )}
                aria-invalid={errors.phone ? true : undefined}
              />
              <Button
                type="button"
                variant="outline"
                className="shrink-0"
                onClick={handleSendSmsCode}
                disabled={
                  isSendingSms ||
                  isPhoneVerifying ||
                  (isPhoneVerified && isPhoneAvailable)
                }
              >
                {isSendingSms ? "발송 중" : smsSent ? "재발송" : "인증번호 발송"}
              </Button>
            </div>
            {smsSent && !(isPhoneVerified && isPhoneAvailable) ? (
              <div className="mt-2 flex gap-2">
                <input
                  id="smsCode"
                  type="text"
                  value={smsCode}
                  onChange={(event) => {
                    setSmsCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                    setErrors((current) => ({ ...current, phone: undefined }));
                  }}
                  placeholder="6자리 인증번호"
                  inputMode="numeric"
                  maxLength={6}
                  className={cn(
                    "min-h-9 w-full rounded-[7px] border border-[#cbd5e1] bg-white px-2.5 py-2 text-lg text-ink",
                    "placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20",
                    errors.phone ? "border-red" : "",
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "shrink-0",
                    isPhoneVerified &&
                      isPhoneAvailable &&
                      "border-green bg-[#e8f8ef] text-green hover:bg-[#e8f8ef]",
                  )}
                  onClick={handleVerifySmsCode}
                  disabled={isPhoneVerifying || smsCode.length !== 6}
                >
                  {isPhoneVerifying
                    ? "인증 중"
                    : isPhoneVerified && isPhoneAvailable
                      ? "휴대폰인증✔"
                      : "인증 확인"}
                </Button>
              </div>
            ) : null}
            {errors.phone ? (
              <p className="mt-1 text-2xl text-red">{errors.phone}</p>
            ) : isPhoneVerified && isPhoneAvailable ? (
              <p className="mt-1 text-2xl text-green">
                휴대폰 인증이 완료되었습니다.{" "}
                <span className="font-bold">로그인 아이디: {usernameFromPhone}</span>
              </p>
            ) : phoneCheck.message ? (
              <p
                className={cn(
                  "mt-1 text-2xl",
                  phoneCheck.status === "available"
                    ? "text-green"
                    : phoneCheck.status === "checking"
                      ? "text-[#64748b]"
                      : "text-red",
                )}
              >
                {phoneCheck.message}
              </p>
            ) : (
              <p className="mt-1 text-2xl text-[#64748b]">
                010-1234-5678 형식으로 입력해 주세요. 숫자만 남겨 로그인 아이디로
                사용됩니다. (예: 01012345678)
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-2xl font-bold text-ink">
              이메일 (선택):권장사항-제품 뉴스레터 발송
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
                  "min-h-9 w-full rounded-[7px] border border-[#cbd5e1] bg-white px-2.5 py-2 text-lg text-ink",
                  "placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20",
                  errors.email ? "border-red" : "",
                )}
                aria-invalid={errors.email ? true : undefined}
              />
              <Button
                type="button"
                variant="outline"
                className="shrink-0"
                onClick={handleSendEmailCode}
                disabled={
                  isSendingEmail ||
                  isEmailVerifying ||
                  (emailVerified && verifiedEmail === normalizedEmail) ||
                  !normalizedEmail
                }
              >
                {isSendingEmail
                  ? "발송 중"
                  : emailSent
                    ? "재발송"
                    : "인증번호 발송"}
              </Button>
            </div>
            {emailSent &&
            !(emailVerified && verifiedEmail === normalizedEmail) ? (
              <div className="mt-2 flex gap-2">
                <input
                  id="emailCode"
                  type="text"
                  value={emailCode}
                  onChange={(event) => {
                    setEmailCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                    setErrors((current) => ({ ...current, email: undefined }));
                  }}
                  placeholder="6자리 인증번호"
                  inputMode="numeric"
                  maxLength={6}
                  className={cn(
                    "min-h-9 w-full rounded-[7px] border border-[#cbd5e1] bg-white px-2.5 py-2 text-lg text-ink",
                    "placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20",
                    errors.email ? "border-red" : "",
                  )}
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
                  onClick={handleVerifyEmailCode}
                  disabled={
                    isEmailVerifying ||
                    emailCode.length !== 6 ||
                    (emailVerified && verifiedEmail === normalizedEmail)
                  }
                >
                  {isEmailVerifying
                    ? "인증 중"
                    : emailVerified && verifiedEmail === normalizedEmail
                      ? "이메일인증✔"
                      : "인증 확인"}
                </Button>
              </div>
            ) : null}
            {errors.email ? (
              <p className="mt-1 text-2xl text-red">{errors.email}</p>
            ) : emailVerified && verifiedEmail === normalizedEmail ? (
              <p className="mt-1 text-2xl text-green">이메일 인증이 완료되었습니다.</p>
            ) : emailCheck.message ? (
              <p
                className={cn(
                  "mt-1 text-2xl",
                  emailCheck.status === "available"
                    ? "text-green"
                    : emailCheck.status === "checking"
                      ? "text-[#64748b]"
                      : "text-red",
                )}
              >
                {emailCheck.message}
              </p>
            ) : (
              <p className="mt-1 text-2xl text-[#64748b]">
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

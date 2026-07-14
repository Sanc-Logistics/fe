import { createHash } from "node:crypto";

export function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

export function normalizePhone(phone: string) {
  return phone.replace(/[^\d]/g, "");
}

export function formatPhone(phone: string) {
  const digits = normalizePhone(phone).slice(0, 11);
  if (digits.length <= 3) {
    return digits;
  }
  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

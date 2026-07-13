export type UserRole = "admin" | "member";

export interface AuthUser {
  username: string;
  role: UserRole;
  name: string;
}

const AUTH_STORAGE_KEY = "sanc-logistics-auth";

/** Temporary local accounts until API auth is ready. */
const TEMP_USERS: Array<AuthUser & { password: string }> = [
  {
    username: "admin",
    password: "admin",
    role: "admin",
    name: "관리자",
  },
  {
    username: "leesh01",
    password: "leesh01",
    role: "member",
    name: "이순희",
  },
  {
    username: "kimjm02",
    password: "kimjm02",
    role: "member",
    name: "김주문",
  },
  {
    username: "parkbn03",
    password: "parkbn03",
    role: "member",
    name: "박보내",
  },
  {
    username: "choijs04",
    password: "choijs04",
    role: "member",
    name: "최접수",
  },
  {
    username: "jungjm05",
    password: "jungjm05",
    role: "member",
    name: "정주문",
  },
  {
    username: "hanbs06",
    password: "hanbs06",
    role: "member",
    name: "한배송",
  },
];

export function getHomePathForRole(role: UserRole) {
  return role === "admin" ? "/admin/OrderManagement" : "/OrderManagement";
}

export function authenticate(username: string, password: string): AuthUser | null {
  const normalizedUsername = username.trim().toLowerCase();
  const normalizedPassword = password.trim().toLowerCase();
  const matched = TEMP_USERS.find(
    (user) =>
      user.username === normalizedUsername &&
      user.password === normalizedPassword,
  );

  if (!matched) {
    return null;
  }

  return {
    username: matched.username,
    role: matched.role,
    name: matched.name,
  };
}

export function saveAuthUser(user: AuthUser) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuthUser() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
}

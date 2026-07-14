export type UserRole = "admin" | "member";

export interface AuthUser {
  username: string;
  role: UserRole;
  name: string;
  id?: number;
  phone?: string;
}

interface LocalMemberAccount {
  username: string;
  password: string;
  name: string;
  phone?: string;
}

const AUTH_STORAGE_KEY = "sanc-logistics-auth";
const LOCAL_MEMBERS_KEY = "sanc-logistics-local-members";

/** Temporary local accounts until API auth is ready. */
const TEMP_USERS: Array<AuthUser & { password: string }> = [
  {
    username: "admin",
    password: "admin",
    role: "admin",
    name: "관리자",
    phone: "",
  },
  {
    username: "leesh01",
    password: "leesh01",
    role: "member",
    name: "이순희",
    phone: "010-1234-5678",
  },
  {
    username: "kimjm02",
    password: "kimjm02",
    role: "member",
    name: "김주문",
    phone: "010-2222-3333",
  },
  {
    username: "parkbn03",
    password: "parkbn03",
    role: "member",
    name: "박보내",
    phone: "010-3333-4444",
  },
  {
    username: "choijs04",
    password: "choijs04",
    role: "member",
    name: "최접수",
    phone: "010-4444-5555",
  },
  {
    username: "jungjm05",
    password: "jungjm05",
    role: "member",
    name: "정주문",
    phone: "010-5555-6666",
  },
  {
    username: "hanbs06",
    password: "hanbs06",
    role: "member",
    name: "한배송",
    phone: "010-6666-7777",
  },
];

function getLocalMembers(): LocalMemberAccount[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(LOCAL_MEMBERS_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as LocalMemberAccount[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function registerLocalMember(member: LocalMemberAccount) {
  if (typeof window === "undefined") {
    return;
  }

  const username = member.username.trim().toLowerCase();
  const nextMembers = getLocalMembers().filter((item) => item.username !== username);
  nextMembers.push({
    username,
    password: member.password,
    name: member.name.trim(),
    phone: member.phone,
  });
  window.localStorage.setItem(LOCAL_MEMBERS_KEY, JSON.stringify(nextMembers));
}

export function getHomePathForRole(role: UserRole) {
  return role === "admin" ? "/admin/OrderManagement" : "/OrderManagement";
}

export function authenticate(username: string, password: string): AuthUser | null {
  const normalizedUsername = username.trim().toLowerCase();
  const normalizedPassword = password.trim().toLowerCase();

  const matchedTemp = TEMP_USERS.find(
    (user) =>
      user.username === normalizedUsername &&
      user.password === normalizedPassword,
  );

  if (matchedTemp) {
    return {
      username: matchedTemp.username,
      role: matchedTemp.role,
      name: matchedTemp.name,
      phone: matchedTemp.phone,
    };
  }

  const matchedLocal = getLocalMembers().find(
    (user) =>
      user.username === normalizedUsername &&
      user.password.toLowerCase() === normalizedPassword,
  );

  if (!matchedLocal) {
    return null;
  }

  return {
    username: matchedLocal.username,
    role: "member",
    name: matchedLocal.name,
    phone: matchedLocal.phone,
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

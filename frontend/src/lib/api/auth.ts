import type { UserSession } from "@/lib/auth-session";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export type AuthUser = {
  id: string;
  phone: string;
  username: string;
  avatar_url: string;
  role: string;
  status: string;
  created_at: string;
  last_login_at?: string | null;
};

export type AuthResponse = {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  user: AuthUser;
};

export type SendSmsCodeResponse = {
  success: boolean;
  expires_in: number;
  dev_code?: string | null;
};

export class AuthApiError extends Error {
  code?: string;
  status: number;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
    this.code = code;
  }
}

export async function registerWithPassword(phone: string, password: string, confirmPassword: string) {
  return authRequest<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ phone, password, confirm_password: confirmPassword }),
  });
}

export async function loginWithPassword(phone: string, password: string) {
  return authRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ phone, password }),
  });
}

export async function sendSmsCode(phone: string, purpose: "login" | "register") {
  return authRequest<SendSmsCodeResponse>("/api/auth/send-sms-code", {
    method: "POST",
    body: JSON.stringify({ phone, purpose }),
  });
}

export async function loginWithSmsCode(phone: string, smsCode: string) {
  return authRequest<AuthResponse>("/api/auth/login/sms", {
    method: "POST",
    body: JSON.stringify({ phone, sms_code: smsCode }),
  });
}

export async function logoutWithRefreshToken(refreshToken: string) {
  return authRequest<{ success: boolean }>("/api/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

export function toUserSession(auth: AuthResponse): UserSession {
  return {
    isAuthenticated: true,
    authMode: "user",
    token: auth.access_token,
    refreshToken: auth.refresh_token,
    user: {
      id: auth.user.id,
      name: auth.user.username,
      phone: auth.user.phone,
      avatar: auth.user.avatar_url,
      avatarUrl: auth.user.avatar_url,
      role: auth.user.role,
      company: "StyleForge",
    },
    guestId: null,
    guestStartedAt: null,
    guestLimits: null,
    workspaceId: "styleforge-workspace",
    plan: "trial",
    permissions: {
      canSaveToCloud: true,
      canViewHistory: true,
      canExport: true,
      canGenerate: true,
    },
    preferences: {
      notificationSoundEnabled: true,
      voiceNotificationEnabled: true,
    },
  };
}

async function authRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    const body = await readErrorBody(response);
    throw new AuthApiError(response.status, body?.message ?? `Request failed: ${response.status}`, body?.code);
  }

  return response.json() as Promise<T>;
}

async function readErrorBody(response: Response): Promise<{ code?: string; message?: string } | undefined> {
  try {
    return (await response.json()) as { code?: string; message?: string };
  } catch {
    return undefined;
  }
}

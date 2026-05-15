"use client";

export type UserPreferences = {
  notificationSoundEnabled?: boolean;
  voiceNotificationEnabled?: boolean;
};

export type UserSession = {
  isAuthenticated?: boolean;
  authMode?: "guest" | "user";
  token?: string | null;
  refreshToken?: string | null;
  user?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    avatarUrl?: string;
    role?: string;
    company?: string;
  } | null;
  guestId?: string | null;
  guestStartedAt?: string | null;
  guestLimits?: {
    canSaveToCloud?: boolean;
    maxTrendAnalyses?: number;
  } | null;
  workspaceId?: string;
  plan?: string;
  permissions?: {
    canSaveToCloud?: boolean;
    canViewHistory?: boolean;
    canExport?: boolean;
    canGenerate?: boolean;
  };
  preferences?: UserPreferences;
};

export const AUTH_SESSION_STORAGE_KEY = "styleforge-auth-session";

export function readStoredAuthSession(): UserSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedSession = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
    return storedSession ? (JSON.parse(storedSession) as UserSession) : null;
  } catch {
    return null;
  }
}

export function writeStoredAuthSession(session: UserSession) {
  window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("styleforge-auth-session-change"));
}

export function clearStoredAuthSession() {
  window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  window.dispatchEvent(new Event("styleforge-auth-session-change"));
}

export function getUserInitials(name?: string | null, fallback = "G") {
  if (!name?.trim()) {
    return fallback;
  }

  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return words[0].slice(0, 2).toUpperCase();
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Loader2, MessageSquareText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  type AuthResponse,
  loginWithPassword,
  loginWithSmsCode,
  registerWithPassword,
  sendSmsCode,
} from "@/lib/api/auth";

const phonePattern = /^1[3-9]\d{9}$/;

type AuthMode = "login" | "register";
type LoginMode = "password" | "sms";

type AuthDialogProps = {
  brandName: string;
  initialMode: AuthMode;
  onClose: () => void;
  onGuest: () => void;
  onAuthenticated: (auth: AuthResponse) => void;
};

export function AuthDialog({ brandName, initialMode, onClose, onGuest, onAuthenticated }: AuthDialogProps) {
  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
  const [loginMode, setLoginMode] = useState<LoginMode>("password");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [message, setMessage] = useState<{ type: "error" | "info" | "success"; text: string } | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  const phoneError = useMemo(() => {
    if (!phone) {
      return null;
    }
    return phonePattern.test(phone) ? null : "请输入有效的中国大陆手机号";
  }, [phone]);

  const passwordError = useMemo(() => {
    if (!password || authMode !== "register") {
      return null;
    }
    if (password.length < 8) {
      return "密码至少 8 位";
    }
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return "密码需同时包含字母和数字";
    }
    return null;
  }, [authMode, password]);

  const confirmPasswordError = useMemo(() => {
    if (authMode !== "register" || !confirmPassword) {
      return null;
    }
    return password === confirmPassword ? null : "两次输入的密码不一致";
  }, [authMode, confirmPassword, password]);

  const canSubmit =
    phonePattern.test(phone) &&
    !isSubmitting &&
    (authMode === "register"
      ? password.length >= 8 && !passwordError && password === confirmPassword
      : loginMode === "password"
        ? password.length > 0
        : /^\d{6}$/.test(smsCode));

  async function handleSubmit() {
    if (!canSubmit) {
      setMessage({ type: "error", text: "请先完成必填项并修正表单提示" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    try {
      const auth =
        authMode === "register"
          ? await registerWithPassword(phone, password, confirmPassword)
          : loginMode === "password"
            ? await loginWithPassword(phone, password)
            : await loginWithSmsCode(phone, smsCode);
      onAuthenticated(auth);
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "认证失败，请稍后重试" });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSendCode() {
    if (!phonePattern.test(phone) || countdown > 0 || isSendingCode) {
      setMessage({ type: "error", text: "请先输入有效手机号" });
      return;
    }

    setIsSendingCode(true);
    setMessage(null);
    try {
      const response = await sendSmsCode(phone, authMode === "register" ? "register" : "login");
      setCountdown(Math.min(response.expires_in, 60));
      setDevCode(response.dev_code ?? null);
      setMessage({ type: "success", text: response.dev_code ? `开发验证码：${response.dev_code}` : "验证码已发送" });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "验证码发送失败" });
    } finally {
      setIsSendingCode(false);
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-label={`进入 ${brandName} 工作台`}
        className="relative w-full max-w-md overflow-hidden rounded-xl border border-cyan-300/25 bg-card text-card-foreground shadow-2xl shadow-cyan-950/50"
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.96 }}
        transition={{ duration: 0.2 }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(34,211,238,0.22),transparent_34%),radial-gradient(circle_at_82%_12%,rgba(167,139,250,0.2),transparent_32%)]" />
        <div className="relative p-5">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-lg border border-cyan-300/40 bg-gradient-to-br from-cyan-300/25 to-violet-400/25 text-sm font-black text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.28)]">
                DM
              </div>
              <div>
                <h2 className="text-lg font-semibold">进入 {brandName} 工作台</h2>
                <p className="mt-1 text-xs text-muted-foreground">登录后可保存方案、查看历史，并继续生成服装设计资产。</p>
              </div>
            </div>
            <Button type="button" variant="ghost" size="icon" className="size-8 shrink-0" onClick={onClose} aria-label="关闭登录弹窗">
              <X className="size-4" />
            </Button>
          </div>

          <div className="mb-4 grid grid-cols-2 rounded-lg border bg-background/55 p-1">
            {(["login", "register"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setAuthMode(mode);
                  setMessage(null);
                }}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  authMode === mode ? "bg-primary text-primary-foreground shadow-lg shadow-cyan-500/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {mode === "login" ? "登录" : "注册"}
              </button>
            ))}
          </div>

          {authMode === "login" && (
            <div className="mb-4 grid grid-cols-2 rounded-lg bg-muted/50 p-1">
              {(["password", "sms"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setLoginMode(mode);
                    setMessage(null);
                  }}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                    loginMode === mode ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {mode === "password" ? "密码登录" : "验证码登录"}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-xs text-muted-foreground">手机号</span>
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(event) => setPhone(event.target.value.trim())}
                placeholder="请输入 11 位手机号"
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/70"
              />
              {phoneError && <span className="mt-1 block text-xs text-destructive">{phoneError}</span>}
            </label>

            {(authMode === "register" || loginMode === "password") && (
              <label className="block">
                <span className="mb-1.5 block text-xs text-muted-foreground">{authMode === "register" ? "设置密码" : "密码"}</span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="至少 8 位，包含字母和数字"
                    className="h-10 w-full rounded-md border bg-background px-3 pr-10 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/70"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label={showPassword ? "隐藏密码" : "显示密码"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {passwordError && <span className="mt-1 block text-xs text-destructive">{passwordError}</span>}
              </label>
            )}

            {authMode === "register" && (
              <label className="block">
                <span className="mb-1.5 block text-xs text-muted-foreground">确认密码</span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="请再次输入密码"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/70"
                />
                {confirmPasswordError && <span className="mt-1 block text-xs text-destructive">{confirmPasswordError}</span>}
              </label>
            )}

            {authMode === "login" && loginMode === "sms" && (
              <label className="block">
                <span className="mb-1.5 block text-xs text-muted-foreground">短信验证码</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={smsCode}
                    onChange={(event) => setSmsCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="6 位验证码"
                    className="h-10 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/70"
                  />
                  <Button type="button" variant="outline" className="w-32 shrink-0" onClick={handleSendCode} disabled={countdown > 0 || isSendingCode}>
                    {isSendingCode ? <Loader2 className="size-4 animate-spin" /> : <MessageSquareText className="size-4" />}
                    {countdown > 0 ? `${countdown}s` : "获取验证码"}
                  </Button>
                </div>
                {devCode && <span className="mt-1 block text-xs text-muted-foreground">开发环境验证码：{devCode}</span>}
              </label>
            )}
          </div>

          {message && (
            <div
              className={`mt-4 rounded-md border px-3 py-2 text-xs ${
                message.type === "error" ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-primary/30 bg-primary/10 text-primary"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="mt-5 space-y-3">
            <Button
              type="button"
              className="w-full bg-gradient-to-r from-cyan-400 via-sky-500 to-violet-500 text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.36)] hover:brightness-110"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {authMode === "login" ? "登录并进入" : "注册并进入"}
              {!isSubmitting && <ArrowRight className="size-4" />}
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={onGuest}>
              暂不登录，先进入体验
            </Button>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}

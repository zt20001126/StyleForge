"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, Send, Sparkles, UserRound, X, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUserInitials, readStoredAuthSession, type UserSession } from "@/lib/auth-session";
import { cn } from "@/lib/utils";
import {
  type AssistantNotification,
  useAssistantNotificationStore,
} from "@/store/assistant-notification-store";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  avatarUrl?: string;
  senderName?: string;
  createdAt?: string;
};

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content: "你好，我是多梦小助手。可以陪你做爆款趋势判断、服装灵感拆解和 AI 生成提示词整理。",
  },
];

const assistantPrompts = [
  "来找我做灵感",
  "不知道怎么设计？问问我",
  "需要爆款趋势建议吗？",
  "我可以帮你生成设计方向",
  "遇到问题点我试试",
];

// Reserved for a future local audio asset: new Audio(notificationSoundPath).play().
const notificationSoundPath = "/sounds/assistant-notify.mp3";

const notificationTheme = {
  success: {
    label: "完成提醒",
    icon: CheckCircle2,
    panel: "border-emerald-300/30",
    accent: "bg-emerald-300/80",
    glow: "bg-emerald-300/25 shadow-[0_0_80px_rgba(52,211,153,0.42)]",
    ring: "border-emerald-300/45",
    button: "bg-emerald-300 text-slate-950 hover:bg-emerald-200",
  },
  error: {
    label: "异常提醒",
    icon: XCircle,
    panel: "border-rose-300/30",
    accent: "bg-rose-300/80",
    glow: "bg-rose-300/25 shadow-[0_0_80px_rgba(251,113,133,0.42)]",
    ring: "border-rose-300/45",
    button: "bg-rose-300 text-slate-950 hover:bg-rose-200",
  },
  warning: {
    label: "注意提醒",
    icon: AlertTriangle,
    panel: "border-amber-300/30",
    accent: "bg-amber-300/80",
    glow: "bg-amber-300/25 shadow-[0_0_80px_rgba(251,191,36,0.38)]",
    ring: "border-amber-300/45",
    button: "bg-amber-300 text-slate-950 hover:bg-amber-200",
  },
  info: {
    label: "任务提醒",
    icon: Info,
    panel: "border-cyan-300/30",
    accent: "bg-cyan-300/80",
    glow: "bg-cyan-300/25 shadow-[0_0_80px_rgba(34,211,238,0.42)]",
    ring: "border-cyan-300/45",
    button: "bg-cyan-300 text-slate-950 hover:bg-cyan-200",
  },
};

async function sendAssistantMessage(message: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 720));

  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("趋势") || normalizedMessage.includes("trend") || normalizedMessage.includes("爆款")) {
    return "可以先从品类、人群、场景、风格关键词四个维度切入。我可以帮你把趋势想法整理成更适合工作台分析的输入。";
  }

  if (normalizedMessage.includes("生成") || normalizedMessage.includes("图片") || normalizedMessage.includes("款")) {
    return "做服装生成时，建议补齐品类、廓形、面料、色彩、场景和卖点。我可以帮你把这些信息整理成一段更稳定的 Prompt。";
  }

  if (normalizedMessage.includes("方案") || normalizedMessage.includes("报告") || normalizedMessage.includes("企划")) {
    return "方案可以按目标人群、核心卖点、款式结构、色彩面料和渠道场景来组织。你给我一个方向，我先帮你搭提纲。";
  }

  return "我收到啦。第一版我先用前端模拟回复，后续接入真实助手接口后，就能结合当前页面和业务数据给你更具体的服装设计建议。";
}

function DreamAssistantAvatar({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "relative isolate flex shrink-0 items-center justify-center",
        compact ? "size-10" : "size-20 sm:size-28",
      )}
      aria-hidden="true"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-full bg-[conic-gradient(from_140deg,var(--primary),var(--accent),#38bdf8,var(--primary))] opacity-80 blur-[1px]"
        animate={{ rotate: 360 }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="pointer-events-none absolute inset-[-8px] rounded-full border border-primary/40 shadow-[0_0_44px_rgba(34,211,238,0.45)]"
        animate={{ opacity: [0.28, 0.95, 0.28], scale: [0.9, 1.14, 0.9] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute inset-[-18px] rounded-full bg-primary/20 blur-xl"
        animate={{ opacity: [0.08, 0.32, 0.08], scale: [0.82, 1.22, 0.82] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative flex size-[88%] items-center justify-center rounded-full border border-white/45 bg-gradient-to-br from-slate-950 via-slate-800 to-cyan-950 shadow-2xl shadow-cyan-500/25">
        <div
          className={cn(
            "absolute rounded-full bg-gradient-to-b from-cyan-100 to-violet-100 shadow-inner",
            compact ? "top-2 h-6 w-7" : "top-4 h-11 w-12 sm:top-6 sm:h-14 sm:w-16",
          )}
        >
          <span
            className={cn(
              "absolute rounded-full bg-slate-950 shadow-[0_0_8px_rgba(34,211,238,0.8)]",
              compact ? "left-2 top-3 size-1" : "left-3 top-5 size-1.5 sm:left-4 sm:top-6 sm:size-2",
            )}
          />
          <span
            className={cn(
              "absolute rounded-full bg-slate-950 shadow-[0_0_8px_rgba(34,211,238,0.8)]",
              compact ? "right-2 top-3 size-1" : "right-3 top-5 size-1.5 sm:right-4 sm:top-6 sm:size-2",
            )}
          />
          <span
            className={cn(
              "absolute left-1/2 -translate-x-1/2 rounded-full bg-primary",
              compact ? "bottom-2 h-0.5 w-2.5" : "bottom-3 h-1 w-4 sm:bottom-4 sm:w-5",
            )}
          />
        </div>
        <div
          className={cn(
            "absolute rounded-t-full border border-cyan-200/40 bg-gradient-to-b from-primary/90 to-accent/80",
            compact ? "bottom-1 h-4 w-7" : "bottom-2 h-7 w-11 sm:bottom-3 sm:h-10 sm:w-16",
          )}
        />
        <motion.span
          className={cn(
            "absolute rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.9)]",
            compact ? "bottom-1 right-1 size-2" : "bottom-3 right-3 size-3 sm:bottom-4 sm:right-4 sm:size-4",
          )}
          animate={{ opacity: [0.45, 1, 0.45], scale: [0.85, 1.15, 0.85] }}
          transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}

function UserAvatar({ session }: { session: UserSession | null }) {
  const user = session?.authMode === "user" ? session.user : null;
  const avatarUrl = user?.avatarUrl || user?.avatar;
  const initials = getUserInitials(user?.name, session?.authMode === "user" ? "DM" : "G");

  if (avatarUrl) {
    return (
      <div
        role="img"
        aria-label={user?.name ? `${user.name}头像` : "用户头像"}
        className="size-8 shrink-0 rounded-full border bg-cover bg-center shadow-lg"
        style={{ backgroundImage: `url(${avatarUrl})` }}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-black shadow-lg",
        session?.authMode === "user"
          ? "bg-gradient-to-br from-cyan-300 to-violet-400 text-slate-950"
          : "bg-muted text-muted-foreground",
      )}
      aria-label={session?.authMode === "user" ? "用户头像" : "默认用户头像"}
    >
      {session?.authMode === "user" ? initials : <UserRound className="size-4" />}
    </div>
  );
}

function shouldPlayNotificationSound(session: UserSession | null) {
  return session?.preferences?.notificationSoundEnabled ?? true;
}

function shouldPlayNotificationVoice(session: UserSession | null) {
  return session?.preferences?.voiceNotificationEnabled ?? true;
}

function playAssistantNotificationSound() {
  if (typeof window === "undefined") {
    return;
  }

  void notificationSoundPath;

  const AudioContextConstructor =
    window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextConstructor) {
    return;
  }

  try {
    const context = new AudioContextConstructor();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(720, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(520, context.currentTime + 0.16);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.18);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.2);
    oscillator.addEventListener("ended", () => void context.close());
  } catch {
    // Browser autoplay or audio context restrictions should not block the notification UI.
  }
}

function playAssistantNotificationVoice(notification: AssistantNotification, session: UserSession | null) {
  if (typeof window === "undefined") {
    return;
  }

  const shouldPlayVoice = shouldPlayNotificationVoice(session);
  const shouldPlaySound = shouldPlayNotificationSound(session);

  if (!shouldPlayVoice || !notification.voiceText) {
    if (shouldPlaySound) {
      playAssistantNotificationSound();
    }
    return;
  }

  try {
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
      if (shouldPlaySound) {
        playAssistantNotificationSound();
      }
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(notification.voiceText);
    utterance.lang = "zh-CN";
    utterance.rate = 1;
    utterance.pitch = 1.04;
    utterance.volume = 1;
    utterance.onerror = () => {
      if (shouldPlaySound) {
        playAssistantNotificationSound();
      }
    };

    window.speechSynthesis.speak(utterance);
  } catch {
    if (shouldPlaySound) {
      playAssistantNotificationSound();
    }
  }
}

function DreamAssistantNotification({
  notification,
  onDismiss,
}: {
  notification: AssistantNotification;
  onDismiss: () => void;
}) {
  const theme = notificationTheme[notification.type];
  const Icon = theme.icon;

  return (
    <motion.div
      key={notification.id}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/25 px-4 backdrop-blur-[2px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onPointerDown={onDismiss}
    >
      <motion.div
        className="pointer-events-auto relative flex w-full max-w-md flex-col items-center"
        initial={{ x: "38vw", y: "34vh", scale: 0.72, rotate: 8 }}
        animate={{ x: 0, y: 0, scale: 1, rotate: 0 }}
        exit={{ x: "38vw", y: "34vh", scale: 0.7, rotate: -7, opacity: 0 }}
        transition={{ type: "spring", stiffness: 170, damping: 18 }}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className={cn("pointer-events-none absolute top-24 h-48 w-48 rounded-full blur-3xl", theme.glow)} />
        <motion.div
          className={cn("pointer-events-none absolute top-28 h-40 w-40 rounded-full border", theme.ring)}
          animate={{ scale: [0.88, 1.22, 0.88], opacity: [0.16, 0.58, 0.16] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className={cn(
            "relative mb-4 w-full overflow-visible rounded-xl border bg-background/82 p-4 text-foreground shadow-2xl shadow-black/18 backdrop-blur-xl ring-1 ring-white/18",
            theme.panel,
          )}
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ delay: 0.12, duration: 0.22 }}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),transparent_46%),radial-gradient(circle_at_92%_0%,rgba(34,211,238,0.16),transparent_34%)]" />
            <div className="absolute -right-16 -top-20 h-40 w-40 rounded-full bg-white/12 blur-2xl" />
          </div>
          <div className={cn("pointer-events-none absolute inset-y-3 left-0 w-1 rounded-r-full", theme.accent)} />

          <div className="relative flex items-start gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background/70 shadow-sm backdrop-blur">
              <Icon className="size-4" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-muted-foreground">{theme.label}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
                  onClick={onDismiss}
                  aria-label="关闭通知"
                >
                  <X className="size-3.5" />
                </Button>
              </div>

              <h2 className="text-sm font-semibold leading-5 text-foreground">{notification.title}</h2>
              <p className="mt-1.5 text-sm leading-5 text-muted-foreground">{notification.message}</p>

              <Button
                type="button"
                size="sm"
                className={cn("mt-3 h-8 rounded-full px-4 text-xs shadow-sm", theme.button)}
                onClick={onDismiss}
              >
                {notification.actionText ?? "我知道了"}
              </Button>
            </div>
          </div>

          <span className="pointer-events-none absolute -bottom-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 border-b border-r bg-background/82" />
        </motion.div>

        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, -1.5, 1.5, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="relative rounded-full bg-background/75 p-3 shadow-2xl shadow-cyan-500/30 backdrop-blur"
        >
          <DreamAssistantAvatar />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function FloatingChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [authSession, setAuthSession] = useState<UserSession | null>(() => readStoredAuthSession());
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);
  const [returnPrompt, setReturnPrompt] = useState<string | null>(null);
  const nudgeControls = useAnimationControls();
  const assistantRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const currentNotification = useAssistantNotificationStore((state) => state.current);
  const dismissNotification = useAssistantNotificationStore((state) => state.dismiss);

  const displayPrompt = returnPrompt ?? assistantPrompts[promptIndex];

  useEffect(() => {
    function syncAuthSession() {
      setAuthSession(readStoredAuthSession());
    }

    window.addEventListener("storage", syncAuthSession);
    window.addEventListener("styleforge-auth-session-change", syncAuthSession);
    return () => {
      window.removeEventListener("storage", syncAuthSession);
      window.removeEventListener("styleforge-auth-session-change", syncAuthSession);
    };
  }, []);

  useEffect(() => {
    if (!currentNotification) {
      return;
    }

    playAssistantNotificationVoice(currentNotification, authSession);
  }, [authSession, currentNotification]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  useEffect(() => {
    if (isOpen) {
      return;
    }

    const promptTimer = window.setInterval(() => {
      setPromptIndex((currentIndex) => (currentIndex + 1) % assistantPrompts.length);
    }, 3600);

    return () => window.clearInterval(promptTimer);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      return;
    }

    const nudgeTimer = window.setInterval(() => {
      void nudgeControls.start({
        y: [0, -8, 0],
        rotate: [0, -2.5, 2.5, 0],
        filter: [
          "drop-shadow(0 0 0 rgba(34,211,238,0))",
          "drop-shadow(0 0 18px rgba(34,211,238,0.55))",
          "drop-shadow(0 0 0 rgba(34,211,238,0))",
        ],
        transition: { duration: 0.9, ease: "easeInOut" },
      });
    }, 14000);

    return () => window.clearInterval(nudgeTimer);
  }, [isOpen, nudgeControls]);

  useEffect(() => {
    if (!returnPrompt) {
      return;
    }

    const returnPromptTimer = window.setTimeout(() => setReturnPrompt(null), 3600);
    return () => window.clearTimeout(returnPromptTimer);
  }, [returnPrompt]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node) || assistantRef.current?.contains(target)) {
        return;
      }

      setIsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedValue = inputValue.trim();
    if (!trimmedValue || isSending) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmedValue,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setInputValue("");
    setIsSending(true);

    try {
      const assistantReply = await sendAssistantMessage(trimmedValue);
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: assistantReply,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  function handleDismissNotification() {
    setReturnPrompt(currentNotification?.returnText ?? "我回去啦，有问题再找我～");
    dismissNotification();
  }

  return (
    <div ref={assistantRef} className="contents">
      <AnimatePresence mode="wait">
        {currentNotification ? (
          <DreamAssistantNotification
            key="assistant-notification"
            notification={currentNotification}
            onDismiss={handleDismissNotification}
          />
        ) : isOpen ? (
          <motion.section
            key="chat-window"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-3 right-3 z-50 flex h-[min(520px,calc(100vh-32px))] w-[calc(100vw-24px)] origin-bottom-right flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-2xl shadow-black/25 sm:bottom-6 sm:right-6 sm:w-[360px]"
            aria-label="多梦小助手聊天窗口"
          >
            <header className="relative overflow-hidden border-b bg-background/80 px-4 py-3 backdrop-blur">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(34,211,238,0.2),transparent_34%),radial-gradient(circle_at_85%_20%,rgba(167,139,250,0.18),transparent_30%)]" />
              <div className="relative flex items-center justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <DreamAssistantAvatar compact />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-sm font-semibold">
                      多梦小助手
                      <Sparkles className="size-3.5 shrink-0 text-primary" />
                    </div>
                    <div className="truncate text-xs text-muted-foreground">AI 服装设计助手 · 爆款趋势助手</div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0"
                  onClick={() => setIsOpen(false)}
                  aria-label="关闭多梦小助手"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-end gap-2",
                    message.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  {message.role === "assistant" && <DreamAssistantAvatar compact />}
                  <div
                    className={cn(
                      "relative max-w-[72%] rounded-lg px-3 py-2 text-sm leading-6 shadow-sm",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "border bg-muted/70 text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none absolute bottom-3 size-3 rotate-45",
                        message.role === "user"
                          ? "-right-1.5 bg-primary"
                          : "-left-1.5 border-b border-l bg-muted",
                      )}
                    />
                    {message.content}
                  </div>
                  {message.role === "user" && <UserAvatar session={authSession} />}
                </div>
              ))}

              {isSending && (
                <div className="flex items-end gap-2 justify-start">
                  <DreamAssistantAvatar compact />
                  <div className="flex items-center gap-1.5 rounded-lg border bg-muted/70 px-3 py-2 text-sm text-muted-foreground">
                    <span className="size-1.5 animate-pulse rounded-full bg-primary" />
                    <span className="size-1.5 animate-pulse rounded-full bg-primary [animation-delay:120ms]" />
                    <span className="size-1.5 animate-pulse rounded-full bg-primary [animation-delay:240ms]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2 border-t bg-background/70 p-3">
              <input
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                disabled={isSending}
                placeholder="输入服装灵感或趋势问题..."
                className="min-w-0 flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/70 disabled:opacity-60"
                aria-label="聊天输入"
              />
              <Button type="submit" size="icon" disabled={!inputValue.trim() || isSending} aria-label="发送消息">
                <Send className="size-4" />
              </Button>
            </form>
          </motion.section>
        ) : (
          <motion.button
            key="assistant-bubble"
            type="button"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            whileHover={{ scale: 1.06, rotate: [-1.2, 1.2, -1.2] }}
            whileTap={{ scale: 0.98 }}
            transition={{
              duration: 0.18,
              rotate: { duration: 0.34, repeat: 1, ease: "easeInOut" },
            }}
            className="group fixed bottom-3 right-3 z-50 flex origin-bottom-right flex-col items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 sm:bottom-6 sm:right-6"
            onClick={() => setIsOpen(true)}
            aria-label="打开多梦小助手"
          >
            <motion.div animate={nudgeControls} className="flex origin-bottom flex-col items-center gap-2">
            <motion.div
              className="flex flex-col items-center gap-2"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.7, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="relative flex min-h-12 w-[168px] items-center justify-center rounded-lg border bg-card/95 px-3 py-2 text-center text-sm font-medium leading-5 shadow-xl shadow-black/15 backdrop-blur transition group-hover:border-primary/70 group-hover:shadow-cyan-500/40 sm:w-[188px] sm:px-4 sm:text-base">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={displayPrompt}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22 }}
                  >
                    {displayPrompt}
                  </motion.span>
                </AnimatePresence>
                <span className="pointer-events-none absolute -bottom-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 border-b border-r bg-card" />
              </div>
              <div className="relative rounded-full bg-background/70 p-2 shadow-2xl shadow-cyan-500/25 backdrop-blur transition group-hover:shadow-[0_0_54px_rgba(34,211,238,0.58)] sm:p-3">
                <DreamAssistantAvatar />
              </div>
              <div className="rounded-full border bg-card/90 px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-lg backdrop-blur sm:px-3 sm:text-sm">
                多梦小助手
              </div>
            </motion.div>
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

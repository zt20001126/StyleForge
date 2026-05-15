"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content: "你好，我是多梦小助手。可以陪你做爆款趋势判断、服装灵感拆解和 AI 生成提示词整理。",
  },
];

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

export function FloatingChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const assistantRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const hasUserMessage = useMemo(() => messages.some((message) => message.role === "user"), [messages]);
  const hasDraft = inputValue.trim().length > 0;
  const canAutoClose = !hasDraft && !hasUserMessage;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node) || assistantRef.current?.contains(target)) {
        return;
      }

      if (canAutoClose) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [canAutoClose, isOpen]);

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

  return (
    <div ref={assistantRef} className="fixed bottom-3 right-3 z-50 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {isOpen ? (
          <motion.section
            key="chat-window"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="flex h-[min(520px,calc(100vh-32px))] w-[calc(100vw-24px)] flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-2xl shadow-black/25 sm:w-[360px]"
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
                  className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[82%] rounded-lg px-3 py-2 text-sm leading-6",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "border bg-muted/70 text-foreground",
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {isSending && (
                <div className="flex justify-start">
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
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            whileHover={{ scale: 1.08, rotate: [-1.5, 1.5, -1.5] }}
            whileTap={{ scale: 0.98 }}
            transition={{
              duration: 0.18,
              rotate: { duration: 0.34, repeat: 1, ease: "easeInOut" },
            }}
            className="group flex flex-col items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
            onClick={() => setIsOpen(true)}
            aria-label="打开多梦小助手"
          >
            <motion.div
              className="flex flex-col items-center gap-2"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2.7, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="relative max-w-[150px] rounded-lg border bg-card/95 px-3 py-2 text-center text-sm font-medium leading-5 shadow-xl shadow-black/15 backdrop-blur transition group-hover:border-primary/70 group-hover:shadow-cyan-500/30 sm:max-w-[168px] sm:px-4 sm:text-base">
                来找我做灵感
                <span className="pointer-events-none absolute -bottom-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 border-b border-r bg-card" />
              </div>
              <div className="relative rounded-full bg-background/70 p-2 shadow-2xl shadow-cyan-500/25 backdrop-blur transition group-hover:shadow-[0_0_54px_rgba(34,211,238,0.58)] sm:p-3">
                <DreamAssistantAvatar />
              </div>
              <div className="rounded-full border bg-card/90 px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-lg backdrop-blur sm:px-3 sm:text-sm">
                多梦小助手
              </div>
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

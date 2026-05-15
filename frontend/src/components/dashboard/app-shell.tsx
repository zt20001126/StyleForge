"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Brush,
  ChevronDown,
  FileText,
  GalleryVerticalEnd,
  History,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  Palette,
  ScanFace,
  Settings,
  Sparkles,
  UserCircle2,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  clearStoredAuthSession,
  getUserInitials,
  readStoredAuthSession,
  type UserSession,
} from "@/lib/auth-session";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { showDreamAssistantNotification } from "@/store/assistant-notification-store";

const navItems = [
  { href: "/trend-workbench", label: "趋势工作台", icon: LayoutDashboard },
  { href: "/trend-reports", label: "历史趋势报告", icon: History },
  { href: "/generate", label: "AI 生成", icon: Sparkles },
  { href: "/gallery", label: "方案库", icon: GalleryVerticalEnd },
  { href: "/generate/text-to-style", label: "以文生款", icon: FileText },
  { href: "/generate/style-variation", label: "以款生款", icon: ImagePlus },
  { href: "/generate/pattern-craft", label: "图案工艺", icon: Brush },
  { href: "/generate/commercial-shoot", label: "换模特背景", icon: ScanFace },
  { href: "/generate/recolor", label: "服装配色", icon: Palette },
  { href: "/generate/try-on", label: "服装上身", icon: UserRound },
  { href: "/settings", label: "设置", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [authSession, setAuthSession] = useState<UserSession | null>(() => readStoredAuthSession());
  const activeHref = navItems
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
  const user = useMemo(() => {
    if (authSession?.authMode === "user" && authSession.user) {
      return {
        name: authSession.user.name || "DM Designer",
        meta: authSession.user.email || "设计师账号",
        modeLabel: "设计师账号",
        initials: getUserInitials(authSession.user.name, "DM"),
      };
    }

    return {
      name: "游客体验用户",
      meta: "暂不登录，正在体验工作台",
      modeLabel: "游客体验中",
      initials: "G",
    };
  }, [authSession]);

  useEffect(() => {
    if (!isUserMenuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node) || userMenuRef.current?.contains(target)) {
        return;
      }
      setIsUserMenuOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isUserMenuOpen]);

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

  function handleLogout() {
    clearStoredAuthSession();
    setAuthSession(null);
    setIsUserMenuOpen(false);
    showDreamAssistantNotification({
      type: "info",
      title: "已退出登录",
      message: "我会继续在这里等你～",
      actionText: "知道了",
      returnText: "有需要随时回来找我～",
      voiceText: "已退出登录，我会继续在这里等你",
      voiceType: "logout",
    });
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-52 border-r bg-card/60 backdrop-blur-xl lg:block">
        <Link href="/" className="flex h-16 items-center gap-2.5 border-b px-4">
          <div className="relative flex size-9 items-center justify-center overflow-hidden rounded-lg border border-cyan-300/45 bg-gradient-to-br from-cyan-300/20 via-slate-950/45 to-violet-400/25 text-xs font-black tracking-wide text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.2)]">
            <span className="absolute inset-0 bg-[linear-gradient(135deg,transparent_12%,rgba(255,255,255,0.2)_45%,transparent_58%)] opacity-50" />
            <span className="relative">DM</span>
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">DM StyleForge</div>
            <div className="text-xs text-muted-foreground">AI Fashion Platform</div>
          </div>
        </Link>
        <nav className="space-y-1 p-2.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2.5 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground",
                activeHref === item.href && "bg-primary/12 text-primary",
              )}
              title={item.label}
            >
              <item.icon className="size-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
      <div className="lg:pl-52">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-xl lg:px-6">
          <div>
            <div className="text-sm font-medium">AI Fashion Trend Platform</div>
            <div className="text-xs text-muted-foreground">趋势分析、设计共创、方案沉淀</div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((open) => !open)}
                className="flex h-10 items-center gap-2 rounded-full border bg-card/70 pl-1.5 pr-2 text-sm transition hover:border-primary/50 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
                aria-haspopup="menu"
                aria-expanded={isUserMenuOpen}
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 to-violet-400 text-xs font-black text-slate-950">
                  {user.initials}
                </span>
                <span className="hidden max-w-24 truncate text-xs text-muted-foreground md:inline">{user.modeLabel}</span>
                <ChevronDown className={cn("size-3.5 text-muted-foreground transition", isUserMenuOpen && "rotate-180")} />
              </button>

              {isUserMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-lg border bg-card text-card-foreground shadow-2xl shadow-black/20"
                >
                  <div className="border-b p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 to-violet-400 text-sm font-black text-slate-950">
                        {user.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{user.name}</div>
                        <div className="truncate text-xs text-muted-foreground">{user.meta}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 rounded-md border bg-background/50 px-3 py-2 text-xs text-muted-foreground">
                      <UserCircle2 className="size-4 text-primary" />
                      {user.modeLabel}
                    </div>
                  </div>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    <LogOut className="size-4" />
                    退出登录
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}

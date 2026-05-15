"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GalleryVerticalEnd, History, LayoutDashboard, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const navItems = [
  { href: "/trend-workbench", label: "趋势工作台", icon: LayoutDashboard },
  { href: "/gallery", label: "方案库", icon: GalleryVerticalEnd },
  { href: "/history", label: "历史", icon: History },
  { href: "/settings", label: "设置", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-card/60 backdrop-blur-xl lg:block">
        <Link href="/" className="flex h-16 items-center gap-3 border-b px-5">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Sparkles className="size-4" />
          </div>
          <div>
            <div className="font-semibold">StyleForge</div>
            <div className="text-xs text-muted-foreground">Trend Design OS</div>
          </div>
        </Link>
        <nav className="space-y-1 p-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground",
                pathname === item.href && "bg-primary/12 text-primary",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-xl lg:px-6">
          <div>
            <div className="text-sm font-medium">AI Fashion Trend Platform</div>
            <div className="text-xs text-muted-foreground">趋势分析、设计共创、方案沉淀</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden rounded-full border px-3 py-1 text-xs text-muted-foreground md:block">Mock mode</div>
            <ThemeToggle />
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}

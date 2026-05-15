import Link from "next/link";
import { ChevronDown, Globe2, Instagram, Mail, MessageCircle, Music2 } from "lucide-react";

const footerGroups = [
  {
    title: "创意工具",
    links: ["趋势分析", "以文生款", "以款生款", "图案工艺"],
  },
  {
    title: "AI工作室",
    links: ["图像生成", "视频生成", "换模特背景", "服装配色"],
  },
  {
    title: "3D精准设计",
    links: ["服装上身", "版型预览", "材质模拟", "系列企划"],
  },
  {
    title: "支持 & 下载",
    links: ["帮助中心", "方案库", "历史记录", "联系我们"],
  },
];

const socialItems = [
  { label: "Instagram", icon: Instagram },
  { label: "小红书", icon: MessageCircle },
  { label: "抖音", icon: Music2 },
];

export function AppFooter() {
  return (
    <footer className="relative z-10 border-t border-slate-200 bg-white text-slate-950">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 lg:grid-cols-[0.9fr_1.5fr] lg:py-16">
        <div className="flex flex-col gap-7">
          <Link href="/" className="flex w-fit items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md border border-cyan-200 bg-cyan-50 text-sm font-semibold text-cyan-700">
              SF
            </div>
            <div>
              <div className="text-base font-semibold">StyleForge</div>
              <div className="text-xs text-slate-500">AI Fashion Platform</div>
            </div>
          </Link>

          <div className="space-y-3 text-sm text-slate-600">
            <a href="mailto:business@styleforge.ai" className="flex w-fit items-center gap-2 transition hover:text-cyan-700">
              <Mail className="size-4 text-cyan-600" />
              商务合作：business@styleforge.ai
            </a>
            <a href="mailto:media@styleforge.ai" className="flex w-fit items-center gap-2 transition hover:text-cyan-700">
              <Mail className="size-4 text-cyan-600" />
              媒体合作：media@styleforge.ai
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {socialItems.map((item) => (
              <a
                key={item.label}
                href="#"
                aria-label={item.label}
                className="flex size-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
              >
                <item.icon className="size-4" />
              </a>
            ))}
            <button
              type="button"
              className="flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm text-slate-600"
            >
              <Globe2 className="size-4 text-cyan-600" />
              简体中文
              <ChevronDown className="size-3.5" />
            </button>
          </div>

          <div className="space-y-2 text-xs leading-5 text-slate-500">
            <p>Copyright © 2026 StyleForge. All rights reserved.</p>
            <p>ICP备案号：沪ICP备2026000000号-1</p>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-semibold text-slate-950">{group.title}</h2>
              <ul className="mt-4 space-y-3">
                {group.links.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-slate-500 transition hover:text-cyan-700">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}

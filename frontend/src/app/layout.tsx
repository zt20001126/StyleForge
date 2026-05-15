import type { Metadata } from "next";
import { Toaster } from "sonner";
import { FloatingChatAssistant } from "@/components/chat/floating-chat-assistant";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "StyleForge | AI Fashion Trend Design",
  description: "AI fashion trend intelligence and design co-creation platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          <FloatingChatAssistant />
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}

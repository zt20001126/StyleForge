"use client";

import { Brush } from "lucide-react";
import { FashionToolPage } from "@/components/generate/fashion-tool-page";

export default function PatternCraftPage() {
  return (
    <FashionToolPage
      config={{
        eyebrow: "Pattern Craft",
        title: "图案工艺",
        description: "为花型图案生成不同工艺效果，先做工艺风格变体，不做精确贴图。",
        icon: Brush,
        primaryAction: "生成工艺效果",
        resultTitle: "工艺效果预览",
        resultPrefix: "Craft",
        tags: ["图案生成", "工艺变体", "Mock"],
        fields: [
          { kind: "upload", label: "图案素材", value: "点击或拖拽上传花型图案" },
          { kind: "select", label: "工艺类型", value: "刺绣", options: ["刺绣", "胶印", "提花", "烫金", "数码印花"] },
          {
            kind: "textarea",
            label: "工艺说明",
            value: "保持图案主体，生成更适合胸前局部装饰和满版印花的工艺质感预览。",
          },
        ],
      }}
    />
  );
}

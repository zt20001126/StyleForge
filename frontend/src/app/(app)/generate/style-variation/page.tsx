"use client";

import { ImagePlus } from "lucide-react";
import { FashionToolPage } from "@/components/generate/fashion-tool-page";

export default function StyleVariationPage() {
  return (
    <FashionToolPage
      config={{
        eyebrow: "Style Variation",
        title: "以款生款",
        description: "基于已有款式图继续衍生同系列新款，当前只展示参考图和变化方向的前端占位。",
        icon: ImagePlus,
        primaryAction: "生成衍生款",
        resultTitle: "衍生款方案",
        resultPrefix: "Variation",
        tags: ["图生图", "参考图", "系列延展"],
        fields: [
          { kind: "upload", label: "参考款式图", value: "点击或拖拽上传已有款式图" },
          {
            kind: "textarea",
            label: "变化方向",
            value: "保留短款夹克轮廓，分别尝试户外机能、通勤轻奢、运动防晒三个系列方向。",
          },
          { kind: "number", label: "生成数量", value: 4, min: 1, max: 6 },
        ],
      }}
    />
  );
}

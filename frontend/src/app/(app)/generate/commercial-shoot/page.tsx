"use client";

import { ScanFace } from "lucide-react";
import { FashionToolPage } from "@/components/generate/fashion-tool-page";

export default function CommercialShootPage() {
  return (
    <FashionToolPage
      config={{
        eyebrow: "Commercial Shoot",
        title: "换模特背景",
        description: "替换模特与拍摄背景，生成商拍图方向。当前先提供模特、背景和场景选择入口。",
        icon: ScanFace,
        primaryAction: "生成商拍预览",
        resultTitle: "商拍图预览",
        resultPrefix: "Shoot",
        tags: ["换背景", "商拍图", "模特替换"],
        fields: [
          { kind: "upload", label: "原始服装或模特图", value: "点击或拖拽上传原图" },
          { kind: "select", label: "模特风格", value: "都市通勤", options: ["都市通勤", "户外运动", "高级冷感", "甜酷街头"] },
          { kind: "select", label: "拍摄背景", value: "纯色电商棚拍", options: ["纯色电商棚拍", "城市街景", "户外露营", "高级影棚"] },
        ],
      }}
    />
  );
}

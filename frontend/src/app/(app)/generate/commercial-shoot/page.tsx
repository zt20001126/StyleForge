"use client";

import { ScanFace } from "lucide-react";
import { FashionWorkbenchPage } from "@/components/generate/fashion-workbench-page";

export default function CommercialShootPage() {
  return (
    <FashionWorkbenchPage
      config={{
        toolType: "commercial-shoot",
        href: "/generate/commercial-shoot",
        eyebrow: "Commercial Shoot",
        title: "换模特背景",
        description: "替换模特与拍摄背景，生成商拍图方向。当前先提供模特、背景和场景选择入口。",
        icon: ScanFace,
        primaryAction: "生成商拍预览",
        resultTitle: "商拍图预览",
        resultPrefix: "Shoot",
        emptyTitle: "上传模特图或服装图，生成商拍预览",
        emptyDescription: "用模特类型和背景风格快速验证商拍方向，当前结果由前端 mock 呈现。",
        reuseActionText: "套用方案",
        referenceCases: [
          {
            id: "shoot-case-1",
            toolType: "commercial-shoot",
            title: "都市通勤棚拍",
            description: "干净电商棚拍光线，突出服装版型和通勤质感。",
            imageUrl: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=700&q=80",
            params: {
              "模特风格": "都市通勤",
              "拍摄背景": "纯色电商棚拍",
            },
          },
          {
            id: "shoot-case-2",
            toolType: "commercial-shoot",
            title: "户外运动场景",
            description: "自然光街景与轻运动姿态，适合防晒、冲锋衣和机能单品。",
            imageUrl: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=700&q=80",
            params: {
              "模特风格": "户外运动",
              "拍摄背景": "户外露营",
            },
          },
          {
            id: "shoot-case-3",
            toolType: "commercial-shoot",
            title: "高级冷感影棚",
            description: "低饱和背景和硬朗侧光，强化高端系列的冷静气质。",
            imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80",
            params: {
              "模特风格": "高级冷感",
              "拍摄背景": "高级影棚",
            },
          },
        ],
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

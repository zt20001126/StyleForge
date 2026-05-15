"use client";

import { UserRound } from "lucide-react";
import { FashionWorkbenchPage } from "@/components/generate/fashion-workbench-page";

export default function TryOnPage() {
  return (
    <FashionWorkbenchPage
      config={{
        toolType: "try-on",
        href: "/generate/try-on",
        eyebrow: "Virtual Try On",
        title: "服装上身",
        description: "将服装穿搭到模特身上生成上身效果图，当前为虚拟试衣能力入口占位。",
        icon: UserRound,
        primaryAction: "生成上身效果",
        resultTitle: "上身效果图",
        resultPrefix: "Try On",
        emptyTitle: "上传服装和模特，生成上身效果图",
        emptyDescription: "用上身姿态和场景参数验证穿搭展示方向，后续可接入虚拟试衣接口。",
        reuseActionText: "使用姿态",
        referenceCases: [
          {
            id: "try-on-case-1",
            toolType: "try-on",
            title: "正面全身展示",
            description: "标准电商姿态，完整展示衣长、肩线和裤装比例。",
            imageUrl: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=700&q=80",
            params: {
              "上身姿态 / 场景": "正面全身",
            },
          },
          {
            id: "try-on-case-2",
            toolType: "try-on",
            title: "半身电商主图",
            description: "聚焦上装领型、袖型和面料垂坠，适合详情页首图。",
            imageUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=80",
            params: {
              "上身姿态 / 场景": "半身电商",
            },
          },
          {
            id: "try-on-case-3",
            toolType: "try-on",
            title: "街拍站姿",
            description: "自然站姿和轻微侧身，适合外套、连衣裙和整套搭配展示。",
            imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80",
            params: {
              "上身姿态 / 场景": "街拍站姿",
            },
          },
        ],
        tags: ["虚拟试衣", "服装图", "模特图"],
        fields: [
          { kind: "upload", label: "服装图", value: "点击或拖拽上传平铺或模特服装图" },
          { kind: "upload", label: "模特图", value: "点击或拖拽上传目标模特图" },
          { kind: "select", label: "上身姿态 / 场景", value: "正面全身", options: ["正面全身", "半身电商", "街拍站姿", "运动动态"] },
        ],
      }}
    />
  );
}

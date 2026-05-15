"use client";

import { UserRound } from "lucide-react";
import { FashionToolPage } from "@/components/generate/fashion-tool-page";

export default function TryOnPage() {
  return (
    <FashionToolPage
      config={{
        eyebrow: "Virtual Try On",
        title: "服装上身",
        description: "将服装穿搭到模特身上生成上身效果图，当前为虚拟试衣能力入口占位。",
        icon: UserRound,
        primaryAction: "生成上身效果",
        resultTitle: "上身效果图",
        resultPrefix: "Try On",
        tags: ["虚拟试衣", "服装图", "模特图"],
        fields: [
          { kind: "upload", label: "服装图", value: "点击或拖拽上传平铺或模特服装图" },
          { kind: "upload", label: "模特图", value: "点击或拖拽上传目标模特图" },
          { kind: "select", label: "试衣场景", value: "正面全身", options: ["正面全身", "半身电商", "街拍站姿", "运动动态"] },
        ],
      }}
    />
  );
}

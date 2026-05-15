"use client";

import { Palette } from "lucide-react";
import { FashionToolPage } from "@/components/generate/fashion-tool-page";

export default function RecolorPage() {
  return (
    <FashionToolPage
      config={{
        eyebrow: "Recolor",
        title: "服装配色",
        description: "替换服装配色与面料质感，后续接入局部重绘和服装区域控制。",
        icon: Palette,
        primaryAction: "生成配色预览",
        resultTitle: "配色预览",
        resultPrefix: "Recolor",
        tags: ["局部重绘", "色卡", "面料替换"],
        fields: [
          { kind: "upload", label: "服装图片", value: "点击或拖拽上传服装图" },
          { kind: "select", label: "主色方案", value: "冰川白 + 雾蓝", options: ["冰川白 + 雾蓝", "浅灰绿 + 银白", "炭黑 + 荧光黄", "奶油白 + 鼠尾草绿"] },
          { kind: "select", label: "面料质感", value: "轻薄防晒", options: ["轻薄防晒", "哑光尼龙", "微皱肌理", "柔软针织"] },
        ],
      }}
    />
  );
}

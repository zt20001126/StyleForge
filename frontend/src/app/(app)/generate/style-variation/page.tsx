"use client";

import { ImagePlus } from "lucide-react";
import { FashionWorkbenchPage } from "@/components/generate/fashion-workbench-page";

export default function StyleVariationPage() {
  return (
    <FashionWorkbenchPage
      config={{
        toolType: "style-variation",
        href: "/generate/style-variation",
        eyebrow: "Style Variation",
        title: "以款生款",
        description: "基于已有款式图继续衍生同系列新款，当前只展示参考图和变化方向的前端占位。",
        icon: ImagePlus,
        primaryAction: "生成衍生款",
        resultTitle: "衍生款方案",
        resultPrefix: "Variation",
        emptyTitle: "上传参考款式图，生成同系列衍生款",
        emptyDescription: "保留原款核心结构，围绕变化方向、模型和生成数量创建前端 mock 任务。",
        tags: ["图生图", "参考图", "系列延展"],
        reuseActionText: "套用方案",
        referenceCases: [
          {
            id: "variation-case-1",
            toolType: "style-variation",
            title: "户外机能夹克系列",
            description: "保留短款夹克轮廓，强化防晒、透气与轻户外结构。",
            imageUrl: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=700&q=80",
            params: { 变化方向: "保留短款夹克轮廓，增加高领遮阳帽、背部透气开口和轻薄防晒面料，延展为户外机能系列。" },
          },
          {
            id: "variation-case-2",
            toolType: "style-variation",
            title: "通勤轻奢衍生款",
            description: "用更干净的廓形、低饱和色和金属细节做系列升级。",
            imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80",
            params: { 变化方向: "保留原款比例，加入通勤轻奢细节：低饱和雾灰色、简洁分割线、隐藏扣件和微光泽面料。" },
          },
          {
            id: "variation-case-3",
            toolType: "style-variation",
            title: "甜酷街头系列",
            description: "在原款基础上增加拼色、抽绳和短廓形街头元素。",
            imageUrl: "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=700&q=80",
            params: { 变化方向: "保留主体廓形，尝试甜酷街头方向：撞色织带、抽绳结构、短款比例和高频上新图案点缀。" },
          },
        ],
        fields: [
          { kind: "upload", label: "参考款式图", value: "点击或拖拽上传已有款式图" },
          {
            kind: "textarea",
            label: "变化方向",
            value: "保留短款夹克轮廓，分别尝试户外机能、通勤轻奢、运动防晒三个系列方向。",
          },
          { kind: "number", label: "生成张数", value: 4, min: 1, max: 6 },
        ],
      }}
    />
  );
}

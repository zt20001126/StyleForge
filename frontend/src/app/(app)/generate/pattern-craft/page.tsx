"use client";

import { Brush } from "lucide-react";
import { FashionWorkbenchPage } from "@/components/generate/fashion-workbench-page";

export default function PatternCraftPage() {
  return (
    <FashionWorkbenchPage
      config={{
        toolType: "pattern-craft",
        href: "/generate/pattern-craft",
        eyebrow: "Pattern Craft",
        title: "图案工艺",
        description: "为花型图案生成不同工艺效果，先做工艺风格变体，不做精确贴图。",
        icon: Brush,
        primaryAction: "生成工艺效果",
        resultTitle: "工艺效果预览",
        resultPrefix: "Craft",
        emptyTitle: "上传花型图案，预览不同工艺质感",
        emptyDescription: "适合先验证刺绣、胶印、提花、烫金等方向，后续可接真实工艺生成任务。",
        reuseActionText: "使用方案",
        referenceCases: [
          {
            id: "craft-case-1",
            toolType: "pattern-craft",
            title: "立体刺绣花型",
            description: "保留花卉主形，用高低针脚和珠光线强调胸前局部装饰。",
            imageUrl: "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=700&q=80",
            params: {
              "工艺类型": "刺绣",
              "工艺说明": "保持图案主体，使用立体刺绣和局部珠光线，适合胸前局部装饰与轻礼服系列。",
            },
          },
          {
            id: "craft-case-2",
            toolType: "pattern-craft",
            title: "金属烫印纹样",
            description: "将几何图案转为低饱和金属光泽，适合节日款和商拍主图。",
            imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=700&q=80",
            params: {
              "工艺类型": "烫金",
              "工艺说明": "将图案转为细腻金属烫印质感，控制反光面积，适合领口、袖口和局部满版点缀。",
            },
          },
          {
            id: "craft-case-3",
            toolType: "pattern-craft",
            title: "柔雾数码印花",
            description: "降低图案边缘锐度，用雾面印花做春夏衬衫和连衣裙。",
            imageUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=80",
            params: {
              "工艺类型": "数码印花",
              "工艺说明": "保留图案色彩层次，降低边缘锐度，生成柔雾数码印花效果，适合春夏衬衫和连衣裙。",
            },
          },
        ],
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

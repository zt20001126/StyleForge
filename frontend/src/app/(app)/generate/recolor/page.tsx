"use client";

import { Palette } from "lucide-react";
import { FashionWorkbenchPage } from "@/components/generate/fashion-workbench-page";

export default function RecolorPage() {
  return (
    <FashionWorkbenchPage
      config={{
        toolType: "recolor",
        href: "/generate/recolor",
        eyebrow: "Recolor",
        title: "服装配色",
        description: "替换服装配色与面料质感，后续接入局部重绘和服装区域控制。",
        icon: Palette,
        primaryAction: "生成配色预览",
        resultTitle: "配色预览",
        resultPrefix: "Recolor",
        emptyTitle: "上传服装图，生成多套配色方案",
        emptyDescription: "保留服装结构，围绕主色、面料质感和颜色偏好输出不同配色方向。",
        reuseActionText: "套用配色",
        referenceCases: [
          {
            id: "recolor-case-1",
            toolType: "recolor",
            title: "冰川白与雾蓝",
            description: "清爽低饱和配色，适合春夏通勤和电商主图。",
            imageUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=80",
            params: {
              "主色方案": "冰川白 + 雾蓝",
              "面料质感": "轻薄防晒",
              "颜色偏好": "低饱和、清透、干净，重点保留衣身结构阴影，适合春夏通勤系列。",
            },
          },
          {
            id: "recolor-case-2",
            toolType: "recolor",
            title: "炭黑荧光线",
            description: "深色主体搭配少量高亮撞色，适合运动机能款。",
            imageUrl: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=700&q=80",
            params: {
              "主色方案": "炭黑 + 荧光黄",
              "面料质感": "哑光尼龙",
              "颜色偏好": "主体保持炭黑，拉链、抽绳和局部压线使用荧光黄，营造运动机能感。",
            },
          },
          {
            id: "recolor-case-3",
            toolType: "recolor",
            title: "奶油白与草绿",
            description: "柔和自然配色，适合生活方式内容和温柔风系列。",
            imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=700&q=80",
            params: {
              "主色方案": "奶油白 + 鼠尾草绿",
              "面料质感": "柔软针织",
              "颜色偏好": "整体偏温柔自然，降低对比度，适合生活方式场景与针织套装。",
            },
          },
        ],
        tags: ["局部重绘", "色卡", "面料替换"],
        fields: [
          { kind: "upload", label: "服装图片", value: "点击或拖拽上传服装图" },
          { kind: "select", label: "主色方案", value: "冰川白 + 雾蓝", options: ["冰川白 + 雾蓝", "浅灰绿 + 银白", "炭黑 + 荧光黄", "奶油白 + 鼠尾草绿"] },
          { kind: "select", label: "面料质感", value: "轻薄防晒", options: ["轻薄防晒", "哑光尼龙", "微皱肌理", "柔软针织"] },
          { kind: "textarea", label: "颜色偏好", value: "偏低饱和、干净通勤，适合春夏电商主图。" },
        ],
      }}
    />
  );
}

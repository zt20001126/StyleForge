"use client";

import { FileText } from "lucide-react";
import { FashionWorkbenchPage } from "@/components/generate/fashion-workbench-page";

export function TextToFashionPage() {
  return (
    <FashionWorkbenchPage
      config={{
        toolType: "text-to-style",
        href: "/generate/text-to-style",
        eyebrow: "Text to Style",
        title: "以文生款",
        description: "输入款式、面料、场景和卖点描述，快速生成服装灵感图。",
        icon: FileText,
        primaryAction: "立即生成",
        resultTitle: "生成结果",
        resultPrefix: "Text Style",
        emptyTitle: "输入款式描述，快速生成服装灵感图",
        emptyDescription: "当前先以前端 mock 方式展示任务创建、参数配置和结果预览，后续可直接接入真实生成任务接口。",
        tags: ["文生款", "Prompt", "Mock"],
        defaultModel: "FS1.0",
        reuseActionText: "做同款",
        referenceCases: [
          {
            id: "text-case-1",
            toolType: "text-to-style",
            title: "晨雾通勤裙装",
            description: "浅雾灰亚麻衬衫裙，干净通勤，高级成衣设计图。",
            imageUrl: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=700&q=80",
            prompt: "浅雾灰 V 领中长款单排扣亚麻衬衫连衣裙，微宽松腰线，干净通勤风，高级成衣设计图。",
          },
          {
            id: "text-case-2",
            toolType: "text-to-style",
            title: "冷感运动外套",
            description: "雾感蓝防晒外套，Boxy 廓形，轻量透气面料。",
            imageUrl: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=700&q=80",
            prompt: "女款冷感运动防晒外套，雾感蓝与青柠点缀，Boxy 廓形，弧形分割线，轻量透气面料。",
          },
          {
            id: "text-case-3",
            toolType: "text-to-style",
            title: "复古包袋灵感",
            description: "硬挺方形手袋，黑棕复古皮革，高级商业摄影质感。",
            imageUrl: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=700&q=80",
            prompt: "黑棕复古皮革通勤手袋，硬挺方形轮廓，金属扣件，细腻纹理，高级商业摄影质感。",
          },
          {
            id: "text-case-4",
            toolType: "text-to-style",
            title: "旅行机能箱包",
            description: "橄榄绿色旅行箱，年轻户外生活方式场景。",
            imageUrl: "https://images.unsplash.com/photo-1581553680321-4fffae59fccd?auto=format&fit=crop&w=700&q=80",
            prompt: "橄榄绿色轻机能旅行箱，圆角结构，黑色护角，水边假日场景，年轻户外生活方式。",
          },
          {
            id: "text-case-5",
            toolType: "text-to-style",
            title: "针织帽款",
            description: "柔软羊毛针织渔夫帽，米色与孔雀蓝拼接。",
            imageUrl: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=700&q=80",
            prompt: "秋冬羊毛针织渔夫帽，米色拼接孔雀蓝织带，柔软肌理，极简产品图背景。",
          },
          {
            id: "text-case-6",
            toolType: "text-to-style",
            title: "童装叠穿套装",
            description: "青柠绿童装马甲套装，春季明亮产品图。",
            imageUrl: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=700&q=80",
            prompt: "青柠绿色童装马甲套装，圆点内搭，轻量棉服结构，可爱明亮的春季产品图。",
          },
        ],
        fields: [
          {
            kind: "textarea",
            label: "文字描述",
            value: "",
            placeholder: "输入款式描述，例如：V领白色中长款单排扣亚麻衬衫连衣裙，干净通勤风，高级成衣设计图。",
          },
          { kind: "number", label: "生成张数", value: 1, min: 1, max: 4 },
        ],
      }}
    />
  );
}

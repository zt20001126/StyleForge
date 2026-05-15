import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <div>
        <p className="text-sm text-muted-foreground">Workspace Settings</p>
        <h1 className="text-2xl font-semibold">设置</h1>
      </div>
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>接口与模型配置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>前端默认启用 mock 模式；设置 NEXT_PUBLIC_USE_MOCKS=false 后，会通过 NEXT_PUBLIC_API_BASE_URL 连接后端 FastAPI。</p>
          <p>后端默认 USE_MOCK_AI=true，真实模型供应商和 API Key 仍保留为后续配置。</p>
        </CardContent>
      </Card>
    </div>
  );
}

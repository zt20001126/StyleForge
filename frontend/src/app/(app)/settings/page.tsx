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
        <CardContent className="text-sm text-muted-foreground">
          MVP 当前使用 mock 数据。后续将通过 `NEXT_PUBLIC_API_BASE_URL` 与后端 FastAPI 服务连接。
        </CardContent>
      </Card>
    </div>
  );
}

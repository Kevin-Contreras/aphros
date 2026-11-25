import type { AiUsageToday } from "@/lib/ai-usage";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

function formatTokens(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function AiUsageBar({ usage }: { usage: AiUsageToday }) {
  const status =
    usage.percent >= 95
      ? { label: "Crítico", variant: "destructive" as const }
      : usage.percent >= 80
        ? { label: "Alto", variant: "secondary" as const }
        : { label: "OK", variant: "default" as const };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <CardDescription>Consumo diario</CardDescription>
          <CardTitle className="font-heading text-2xl">Hoy · Diagnósticos</CardTitle>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-2 text-sm">
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">{usage.requests}</span>
            {" / "}
            {usage.limit} solicitudes
          </p>
          <p className="text-muted-foreground">{usage.percent}% del cupo</p>
        </div>
        <Progress
          value={Math.max(usage.percent, usage.requests > 0 ? 2 : 0)}
          aria-label="Diagnósticos generados hoy"
        />
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>{usage.remaining} restantes</span>
          <span>{formatTokens(usage.totalTokens)} tokens</span>
          <span>{usage.successful} OK</span>
        </div>
      </CardContent>
    </Card>
  );
}

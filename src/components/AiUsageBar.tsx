import type { AiUsageToday } from "@/lib/ai-usage";

function formatTokens(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function AiUsageBar({ usage }: { usage: AiUsageToday }) {
  const tone =
    usage.percent >= 95
      ? "bg-forest"
      : usage.percent >= 80
        ? "bg-clay"
        : "bg-sage";

  return (
    <section className="rounded-2xl border border-sand bg-cream p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[11px] tracking-[0.22em] uppercase text-sage">
            Consumo de IA
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-forest">
            Hoy · Gemini
          </h2>
        </div>
        <p className="text-sm text-mist">
          <span className="font-medium text-forest">{usage.requests}</span>
          {" / "}
          {usage.limit} solicitudes
        </p>
      </div>

      <div
        className="mt-4 h-3 overflow-hidden rounded-full bg-ivory"
        role="progressbar"
        aria-valuenow={usage.requests}
        aria-valuemin={0}
        aria-valuemax={usage.limit}
        aria-label="Solicitudes de IA usadas hoy"
      >
        <div
          className={`h-full rounded-full transition-[width] ${tone}`}
          style={{ width: `${Math.max(usage.percent, usage.requests > 0 ? 2 : 0)}%` }}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-mist">
        <span>{usage.percent}% del cupo diario</span>
        <span>{usage.remaining} restantes</span>
        <span>{formatTokens(usage.totalTokens)} tokens</span>
        <span>{usage.successful} OK</span>
      </div>
    </section>
  );
}

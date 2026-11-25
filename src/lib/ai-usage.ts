import { prisma } from "@/lib/prisma";

const TZ = "America/Guatemala";

/** Free-tier Flash-Lite default: ~500 requests/day */
export function getDailyRequestLimit(): number {
  const raw = process.env.GEMINI_DAILY_REQUEST_LIMIT;
  const n = raw ? Number.parseInt(raw, 10) : 500;
  return Number.isFinite(n) && n > 0 ? n : 500;
}

function startOfTodayInGuatemala(): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return new Date(`${parts}T00:00:00-06:00`);
}

export async function recordAiUsage(input: {
  model: string;
  promptTokens?: number;
  candidatesTokens?: number;
  totalTokens?: number;
  success?: boolean;
}) {
  await prisma.aiUsage.create({
    data: {
      model: input.model,
      promptTokens: input.promptTokens ?? 0,
      candidatesTokens: input.candidatesTokens ?? 0,
      totalTokens: input.totalTokens ?? 0,
      success: input.success ?? true,
    },
  });
}

export type AiUsageToday = {
  requests: number;
  successful: number;
  totalTokens: number;
  limit: number;
  percent: number;
  remaining: number;
};

export async function getAiUsageToday(): Promise<AiUsageToday> {
  const since = startOfTodayInGuatemala();
  const limit = getDailyRequestLimit();

  const [requests, successful, tokenAgg] = await Promise.all([
    prisma.aiUsage.count({ where: { createdAt: { gte: since } } }),
    prisma.aiUsage.count({
      where: { createdAt: { gte: since }, success: true },
    }),
    prisma.aiUsage.aggregate({
      where: { createdAt: { gte: since } },
      _sum: { totalTokens: true },
    }),
  ]);

  const totalTokens = tokenAgg._sum.totalTokens ?? 0;
  const percent = Math.min(100, Math.round((requests / limit) * 100));

  return {
    requests,
    successful,
    totalTokens,
    limit,
    percent,
    remaining: Math.max(0, limit - requests),
  };
}

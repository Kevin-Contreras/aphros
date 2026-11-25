import { prisma } from "@/lib/prisma";

export type DailyTrendPoint = {
  date: string;
  label: string;
  leads: number;
  whatsapp: number;
};

export type SkinTypeDistribution = {
  type: string;
  count: number;
  percentage: number;
};

export type ProductRecommendationStat = {
  name: string;
  count: number;
  estimatedValue: number;
};

export type ContactChannelStat = {
  channel: string;
  count: number;
  fill: string;
};

export type ImpactMetrics = {
  totalLeads: number;
  whatsappLeads: number;
  whatsappConversionRate: number;
  emailSentCount: number;
  emailDeliveryRate: number;
  totalEstimatedValue: number;
  averageValuePerLead: number;
  averageProductsPerLead: number;
  dailyTrends: DailyTrendPoint[];
  skinTypeDistribution: SkinTypeDistribution[];
  topRecommendedProducts: ProductRecommendationStat[];
  contactChannels: ContactChannelStat[];
};

export async function getImpactMetrics(): Promise<ImpactMetrics> {
  const submissions = await prisma.quizSubmission.findMany({
    orderBy: { createdAt: "asc" },
  });

  const totalLeads = submissions.length;

  if (totalLeads === 0) {
    return {
      totalLeads: 0,
      whatsappLeads: 0,
      whatsappConversionRate: 0,
      emailSentCount: 0,
      emailDeliveryRate: 0,
      totalEstimatedValue: 0,
      averageValuePerLead: 0,
      averageProductsPerLead: 0,
      dailyTrends: [],
      skinTypeDistribution: [],
      topRecommendedProducts: [],
      contactChannels: [],
    };
  }

  let whatsappCount = 0;
  let emailSentCount = 0;
  let totalEstimatedValue = 0;
  let totalProductsCount = 0;

  const skinTypeCounts: Record<string, number> = {};
  const productStats: Record<string, { count: number; totalValue: number }> = {};
  const dateMap: Record<string, { leads: number; whatsapp: number }> = {};

  for (const item of submissions) {
    const hasWhatsapp = Boolean(item.whatsapp && item.whatsapp.trim().length > 3);
    if (hasWhatsapp) {
      whatsappCount++;
    }

    if (item.emailSent) {
      emailSentCount++;
    }

    // Daily trend grouping (YYYY-MM-DD)
    const dateKey = item.createdAt.toISOString().slice(0, 10);
    if (!dateMap[dateKey]) {
      dateMap[dateKey] = { leads: 0, whatsapp: 0 };
    }
    dateMap[dateKey].leads++;
    if (hasWhatsapp) {
      dateMap[dateKey].whatsapp++;
    }

    // Skin type extraction
    try {
      const analysis = JSON.parse(item.skinAnalysis) as { skinType?: string };
      if (analysis?.skinType) {
        const rawType = analysis.skinType.trim();
        // Capitalize first letter
        const normalized =
          rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase();
        skinTypeCounts[normalized] = (skinTypeCounts[normalized] || 0) + 1;
      }
    } catch {
      // ignore JSON parse errors
    }

    // Recommended products extraction
    try {
      const products = JSON.parse(item.recommendedProducts) as Array<{
        name?: string;
        price?: number;
      }>;
      if (Array.isArray(products)) {
        totalProductsCount += products.length;
        for (const prod of products) {
          if (!prod?.name) continue;
          const price = typeof prod.price === "number" ? prod.price : 0;
          totalEstimatedValue += price;

          if (!productStats[prod.name]) {
            productStats[prod.name] = { count: 0, totalValue: 0 };
          }
          productStats[prod.name].count++;
          productStats[prod.name].totalValue += price;
        }
      }
    } catch {
      // ignore JSON parse errors
    }
  }

  // Generate continuous daily trends for at least the last 14 days, or existing range
  const sortedDateKeys = Object.keys(dateMap).sort();
  const dailyTrends: DailyTrendPoint[] = sortedDateKeys.map((key) => {
    const [, month, day] = key.split("-");
    return {
      date: key,
      label: `${day}/${month}`,
      leads: dateMap[key].leads,
      whatsapp: dateMap[key].whatsapp,
    };
  });

  const skinTypeDistribution: SkinTypeDistribution[] = Object.entries(
    skinTypeCounts,
  )
    .map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / totalLeads) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  const topRecommendedProducts: ProductRecommendationStat[] = Object.entries(
    productStats,
  )
    .map(([name, data]) => ({
      name,
      count: data.count,
      estimatedValue: Math.round(data.totalValue),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const contactChannels: ContactChannelStat[] = [
    {
      channel: "WhatsApp y Correo",
      count: whatsappCount,
      fill: "var(--color-primary)",
    },
    {
      channel: "Solo Correo",
      count: totalLeads - whatsappCount,
      fill: "var(--color-muted-foreground)",
    },
  ];

  return {
    totalLeads,
    whatsappLeads: whatsappCount,
    whatsappConversionRate: Math.round((whatsappCount / totalLeads) * 100),
    emailSentCount,
    emailDeliveryRate: Math.round((emailSentCount / totalLeads) * 100),
    totalEstimatedValue: Math.round(totalEstimatedValue),
    averageValuePerLead: Math.round(totalEstimatedValue / totalLeads),
    averageProductsPerLead: Number((totalProductsCount / totalLeads).toFixed(1)),
    dailyTrends,
    skinTypeDistribution,
    topRecommendedProducts,
    contactChannels,
  };
}

"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  ContactChannelStat,
  DailyTrendPoint,
  ProductRecommendationStat,
  SkinTypeDistribution,
} from "@/lib/analytics";

const leadsTrendConfig: ChartConfig = {
  leads: {
    label: "Total Envíos",
    color: "#6b8f71",
  },
  whatsapp: {
    label: "Con WhatsApp",
    color: "#cc7f6b",
  },
};

export function LeadsTrendChart({ data }: { data: DailyTrendPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No hay datos suficientes para graficar tendencias
      </div>
    );
  }

  return (
    <ChartContainer config={leadsTrendConfig} className="h-72 w-full">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="fillLeads" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6b8f71" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#6b8f71" stopOpacity={0.0} />
          </linearGradient>
          <linearGradient id="fillWhatsapp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#cc7f6b" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#cc7f6b" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={12}
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={12}
        />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <Area
          type="monotone"
          dataKey="leads"
          stroke="#6b8f71"
          strokeWidth={2}
          fill="url(#fillLeads)"
        />
        <Area
          type="monotone"
          dataKey="whatsapp"
          stroke="#cc7f6b"
          strokeWidth={2}
          fill="url(#fillWhatsapp)"
        />
        <ChartLegend content={<ChartLegendContent />} />
      </AreaChart>
    </ChartContainer>
  );
}

const skinTypeConfig: ChartConfig = {
  count: {
    label: "Diagnósticos",
    color: "#6b8f71",
  },
};

export function SkinTypeChart({ data }: { data: SkinTypeDistribution[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Sin diagnósticos registrados
      </div>
    );
  }

  const palette = ["#6b8f71", "#4f6f55", "#7a6a4f", "#5c6558", "#2f3d2c", "#8fa995"];

  return (
    <ChartContainer config={skinTypeConfig} className="h-72 w-full">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
      >
        <CartesianGrid horizontal={false} strokeDasharray="3 3" opacity={0.3} />
        <XAxis type="number" allowDecimals={false} fontSize={12} />
        <YAxis
          dataKey="type"
          type="category"
          tickLine={false}
          axisLine={false}
          fontSize={12}
          width={75}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name, item) => (
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="text-muted-foreground">{item.payload.type}:</span>
                  <span className="font-semibold text-foreground">
                    {value} ({item.payload.percentage}%)
                  </span>
                </div>
              )}
            />
          }
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

const productsConfig: ChartConfig = {
  count: {
    label: "Recomendaciones",
    color: "#6b8f71",
  },
  estimatedValue: {
    label: "Valor Total (Q)",
    color: "#7a6a4f",
  },
};

export function TopProductsChart({
  data,
}: {
  data: ProductRecommendationStat[];
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Aún no se han generado recomendaciones de productos
      </div>
    );
  }

  return (
    <ChartContainer config={productsConfig} className="h-72 w-full">
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          fontSize={11}
          interval={0}
          tickFormatter={(val: string) =>
            val.length > 12 ? `${val.slice(0, 11)}…` : val
          }
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          fontSize={12}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name, item) => (
                <div className="flex flex-col gap-1 text-xs">
                  <span className="font-medium text-foreground">
                    {item.payload.name}
                  </span>
                  <span>
                    Frecuencia: <strong>{item.payload.count} veces</strong>
                  </span>
                  <span>
                    Valor potencial: <strong>Q{item.payload.estimatedValue}</strong>
                  </span>
                </div>
              )}
            />
          }
        />
        <Bar dataKey="count" fill="#6b8f71" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}

const channelConfig: ChartConfig = {
  count: {
    label: "Leads",
    color: "#6b8f71",
  },
};

export function ContactChannelChart({ data }: { data: ContactChannelStat[] }) {
  if (data.length === 0 || data.every((d) => d.count === 0)) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Sin leads registrados
      </div>
    );
  }

  const colors = ["#6b8f71", "#cc7f6b"];

  return (
    <ChartContainer config={channelConfig} className="mx-auto h-72 w-full">
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name, item) => (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{item.payload.channel}:</span>
                  <span className="font-semibold text-foreground">{value} leads</span>
                </div>
              )}
            />
          }
        />
        <Pie
          data={data}
          dataKey="count"
          nameKey="channel"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={3}
          strokeWidth={2}
          stroke="#fffdf8"
        >
          {data.map((_, index) => (
            <Cell key={`channel-cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent />} />
      </PieChart>
    </ChartContainer>
  );
}

import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  HelpCircleIcon,
  MessageCircleIcon,
  PackageIcon,
  SparklesIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";
import {
  ContactChannelChart,
  LeadsTrendChart,
  SkinTypeChart,
  TopProductsChart,
} from "@/components/admin/ImpactCharts";
import { getImpactMetrics } from "@/lib/analytics";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

function ImpactFallback() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    </div>
  );
}

async function ImpactContent() {
  await connection();
  const metrics = await getImpactMetrics();

  return (
    <div className="flex flex-col gap-8">
      {/* Page Title */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-3xl font-medium tracking-tight">
              Métricas de Impacto
            </h1>
            <Badge variant="secondary" className="gap-1">
              <SparklesIcon className="size-3" />
              Diagnóstico AI
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Monitorea el alcance del quiz, conversión de clientes potenciales y demanda de productos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/envios">
              Ver lista de envíos
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </div>

      {metrics.totalLeads === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>Sin datos de impacto todavía</EmptyTitle>
            <EmptyDescription>
              A medida que los usuarios completen el quiz de diagnóstico facial, se generarán automáticamente las métricas de conversión y las gráficas.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          {/* KPI Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="transition-all hover:shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription className="text-xs font-medium uppercase tracking-wider">
                  Total Diagnosticados
                </CardDescription>
                <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <UsersIcon className="size-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="font-heading text-3xl font-semibold">
                  {metrics.totalLeads}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Personas que completaron el quiz
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all hover:shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription className="text-xs font-medium uppercase tracking-wider">
                  Captación WhatsApp
                </CardDescription>
                <div className="flex size-8 items-center justify-center rounded-md bg-secondary text-primary">
                  <MessageCircleIcon className="size-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="font-heading text-3xl font-semibold">
                  {metrics.whatsappConversionRate}%
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {metrics.whatsappLeads} de {metrics.totalLeads} dejaron WhatsApp
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all hover:shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription className="text-xs font-medium uppercase tracking-wider">
                  Valor Recomendado
                </CardDescription>
                <div className="flex size-8 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <TrendingUpIcon className="size-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="font-heading text-3xl font-semibold">
                  Q{metrics.totalEstimatedValue.toLocaleString("es-GT")}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  ~Q{metrics.averageValuePerLead} sugeridos por rutina
                </p>
              </CardContent>
            </Card>

            <Card className="transition-all hover:shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription className="text-xs font-medium uppercase tracking-wider">
                  Entrega de Diagnósticos
                </CardDescription>
                <div className="flex size-8 items-center justify-center rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <CheckCircle2Icon className="size-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="font-heading text-3xl font-semibold">
                  {metrics.emailDeliveryRate}%
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {metrics.emailSentCount} enviados por correo
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Charts: Trends & Skin Types */}
          <div className="grid gap-6 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Tendencia de Envíos y Captación</CardTitle>
                <CardDescription>
                  Volumen diario de cuestionarios completados y prospectos con número de WhatsApp.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LeadsTrendChart data={metrics.dailyTrends} />
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Tipos de Piel Diagnosticados</CardTitle>
                <CardDescription>
                  Distribución de condiciones detectadas por el motor de IA.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SkinTypeChart data={metrics.skinTypeDistribution} />
              </CardContent>
            </Card>
          </div>

          {/* Secondary Charts: Products & Channels */}
          <div className="grid gap-6 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Productos Más Recomendados</CardTitle>
                <CardDescription>
                  Frecuencia con la que la IA incluye cada producto en las rutinas personalizadas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TopProductsChart data={metrics.topRecommendedProducts} />
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Canales de Contacto</CardTitle>
                <CardDescription>
                  Proporción de usuarios que compartieron WhatsApp vs solo correo electrónico.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContactChannelChart data={metrics.contactChannels} />
              </CardContent>
            </Card>
          </div>

          {/* Insights / Next Steps Card */}
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-base">Impacto Comercial Estimado</CardTitle>
              <CardDescription>
                Resumen del flujo de conversión de Aphros
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3 text-sm">
              <div className="rounded-lg border bg-background p-4">
                <p className="text-muted-foreground">Productos por rutina</p>
                <p className="mt-1 font-heading text-2xl font-semibold">
                  {metrics.averageProductsPerLead}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Promedio de productos sugeridos por persona
                </p>
              </div>
              <div className="rounded-lg border bg-background p-4">
                <p className="text-muted-foreground">Leads con alta intención</p>
                <p className="mt-1 font-heading text-2xl font-semibold">
                  {metrics.whatsappLeads}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Contactables inmediatamente vía WhatsApp
                </p>
              </div>
              <div className="rounded-lg border bg-background p-4">
                <p className="text-muted-foreground">Ticket promedio estimado</p>
                <p className="mt-1 font-heading text-2xl font-semibold">
                  Q{metrics.averageValuePerLead}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Valor potencial de venta por cada test completado
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default function AdminImpactoPage() {
  return (
    <Suspense fallback={<ImpactFallback />}>
      <ImpactContent />
    </Suspense>
  );
}

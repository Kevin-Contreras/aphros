import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowRightIcon,
  MessageCircleIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";
import { AiUsageBar } from "@/components/AiUsageBar";
import { LeadsTrendChart, SkinTypeChart } from "@/components/admin/ImpactCharts";
import { getAiUsageToday } from "@/lib/ai-usage";
import { getImpactMetrics } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function AdminHomeFallback() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-36 w-full" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}

async function AdminHomeContent() {
  await connection();
  const [products, questions, submissions, aiUsage, metrics] = await Promise.all([
    prisma.product.count(),
    prisma.question.count(),
    prisma.quizSubmission.count(),
    getAiUsageToday(),
    getImpactMetrics(),
  ]);

  const recent = await prisma.quizSubmission.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const stats = [
    { label: "Productos", value: products, href: "/admin/productos" },
    { label: "Preguntas", value: questions, href: "/admin/preguntas" },
    { label: "Envíos", value: submissions, href: "/admin/envios" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-medium tracking-tight">
          Resumen
        </h1>
        <p className="text-sm text-muted-foreground">
          Gestiona el quiz, el catálogo y revisa el impacto de Aphros.
        </p>
      </div>

      <AiUsageBar usage={aiUsage} />

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="transition-colors hover:bg-muted/40">
              <CardHeader>
                <CardDescription>{stat.label}</CardDescription>
                <CardTitle className="font-heading text-3xl">
                  {stat.value}
                </CardTitle>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Impact Overview Section */}
      <Card className="border-primary/20 bg-linear-to-b from-primary/5 to-transparent">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle>Impacto del Quiz</CardTitle>
              <Badge variant="outline" className="gap-1 border-primary/30 text-primary">
                <TrendingUpIcon className="size-3" />
                Métricas Clave
              </Badge>
            </div>
            <CardDescription>
              Resumen de conversión, diagnósticos y valor potencial generado.
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/impacto">
              Ver reporte detallado
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border bg-background/80 p-4 backdrop-blur-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium uppercase tracking-wider">
                  Total Leads
                </span>
                <UsersIcon className="size-4 text-primary" />
              </div>
              <p className="mt-2 font-heading text-2xl font-semibold">
                {metrics.totalLeads}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Cuestionarios completados
              </p>
            </div>

            <div className="rounded-lg border bg-background/80 p-4 backdrop-blur-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium uppercase tracking-wider">
                  Captación WhatsApp
                </span>
                <MessageCircleIcon className="size-4 text-primary" />
              </div>
              <p className="mt-2 font-heading text-2xl font-semibold">
                {metrics.whatsappConversionRate}%
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {metrics.whatsappLeads} con WhatsApp registrado
              </p>
            </div>

            <div className="rounded-lg border bg-background/80 p-4 backdrop-blur-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium uppercase tracking-wider">
                  Valor Recomendado
                </span>
                <TrendingUpIcon className="size-4 text-primary" />
              </div>
              <p className="mt-2 font-heading text-2xl font-semibold">
                Q{metrics.totalEstimatedValue.toLocaleString("es-GT")}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Total en recomendaciones de catálogo
              </p>
            </div>
          </div>

          {metrics.totalLeads > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2 rounded-lg border bg-background/60 p-4">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Tendencia de Diagnósticos
                </p>
                <LeadsTrendChart data={metrics.dailyTrends} />
              </div>
              <div className="flex flex-col gap-2 rounded-lg border bg-background/60 p-4">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Condiciones / Tipos de Piel
                </p>
                <SkinTypeChart data={metrics.skinTypeDistribution} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Últimos envíos</CardTitle>
          <CardDescription>
            Personas que completaron el quiz recientemente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <Empty className="border">
              <EmptyHeader>
                <EmptyTitle>Sin envíos todavía</EmptyTitle>
                <EmptyDescription>
                  Cuando alguien complete el quiz, aparecerá aquí.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead className="text-right">Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">
                          {item.email}
                        </span>
                        {item.whatsapp ? (
                          <Badge variant="outline">WA {item.whatsapp}</Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString("es-GT")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminHomePage() {
  return (
    <Suspense fallback={<AdminHomeFallback />}>
      <AdminHomeContent />
    </Suspense>
  );
}

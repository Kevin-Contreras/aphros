import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
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

type SkinAnalysis = {
  skinType?: string;
  summary?: string;
};

type RecommendedProduct = {
  name: string;
};

function EnviosFallback() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-9 w-36" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

async function EnviosContent() {
  await connection();
  const submissions = await prisma.quizSubmission.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-medium tracking-tight">
          Envíos
        </h1>
        <p className="text-sm text-muted-foreground">
          Historial de personas que completaron el quiz de piel.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial</CardTitle>
          <CardDescription>
            {submissions.length}{" "}
            {submissions.length === 1 ? "envío" : "envíos"} registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <Empty className="border">
              <EmptyHeader>
                <EmptyTitle>Aún no hay envíos</EmptyTitle>
                <EmptyDescription>
                  Completa el quiz público para ver el primero aquí.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Persona</TableHead>
                  <TableHead>Análisis</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((item) => {
                  let analysis: SkinAnalysis = {};
                  let products: RecommendedProduct[] = [];
                  try {
                    analysis = JSON.parse(item.skinAnalysis) as SkinAnalysis;
                  } catch {
                    analysis = {};
                  }
                  try {
                    products = JSON.parse(
                      item.recommendedProducts,
                    ) as RecommendedProduct[];
                  } catch {
                    products = [];
                  }

                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-muted-foreground">
                            {item.email}
                          </span>
                          {item.whatsapp ? (
                            <a
                              href={`https://wa.me/${item.whatsapp.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline"
                            >
                              WA {item.whatsapp}
                            </a>
                          ) : null}
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.createdAt).toLocaleString("es-GT")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex max-w-md flex-col gap-1">
                          <Badge variant="secondary" className="w-fit">
                            {analysis.skinType || "—"}
                          </Badge>
                          {analysis.summary ? (
                            <p className="line-clamp-2 text-muted-foreground">
                              {analysis.summary}
                            </p>
                          ) : null}
                          {products.length > 0 ? (
                            <p className="text-xs text-muted-foreground">
                              {products.map((p) => p.name).join(" · ")}
                            </p>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={item.emailSent ? "default" : "outline"}
                        >
                          {item.emailSent ? "Email enviado" : "Sin email"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/resultado/${item.id}`}>
                            Ver resultado
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminSubmissionsPage() {
  return (
    <Suspense fallback={<EnviosFallback />}>
      <EnviosContent />
    </Suspense>
  );
}

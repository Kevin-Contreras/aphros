"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AphrosShellMark, AphrosWordmark } from "@/components/AphrosShellMark";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "No se pudo iniciar sesión");
        return;
      }
      router.push("/admin");
      router.refresh();
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <Card className="fade-up w-full max-w-md rounded-[2rem] border-border/80 bg-card/95 shadow-xs ring-0 [--card-spacing:--spacing(6)]">
        <CardHeader className="items-center text-center">
          <AphrosShellMark className="mb-2 h-10 w-14" />
          <AphrosWordmark className="mb-2 h-5 w-auto" />
          <CardTitle className="font-heading text-2xl font-normal text-aphros-espresso">
            Acceso admin
          </CardTitle>
          <CardDescription className="font-light">
            Ingresa la contraseña definida en tu archivo .env
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-(--card-spacing)">
          <CardContent>
            <FieldGroup>
              <Field data-invalid={Boolean(error) || undefined}>
                <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={Boolean(error) || undefined}
                  className="h-11 rounded-2xl bg-aphros-blush-50/50"
                  required
                />
              </Field>
              {error ? (
                <Alert variant="destructive" className="rounded-2xl">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
            </FieldGroup>
          </CardContent>
          <CardFooter className="border-border/60 bg-aphros-blush-50/70">
            <Button
              type="submit"
              className="aphros-btn-luxury h-11 w-full rounded-full font-medium"
              disabled={isPending}
            >
              {isPending ? <Spinner data-icon="inline-start" /> : null}
              {isPending ? "Entrando…" : "Entrar"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  LockIcon,
  MailIcon,
  MessageCircleIcon,
  RotateCcwIcon,
  SparklesIcon,
  UserIcon,
} from "lucide-react";
import type { PublicQuestion, QuizAnswerPayload } from "@/lib/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

type Step = "questions" | "contact" | "submitting";

export function QuizClient({ questions }: { questions: PublicQuestion[] }) {
  const [step, setStep] = useState<Step>("questions");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswerPayload[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);

  const current = questions[index];
  const total = questions.length;
  const progressPercent = total === 0 ? 0 : Math.round(((index + 1) / total) * 100);

  const currentAnswer = current
    ? answers.find((a) => a.questionId === current.id)
    : undefined;
  const hasCurrentAnswer = Boolean(currentAnswer);

  // Rotate loading phrases while analyzing
  useEffect(() => {
    if (step !== "submitting") return;
    const phrases = [
      "Analizando las necesidades de tu piel…",
      "Consultando formulaciones botánicas Aphros…",
      "Calculando la rutina exacta para ti…",
      "Casi listo…",
    ];
    const timer = setInterval(() => {
      setLoadingPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 2400);
    return () => clearInterval(timer);
  }, [step]);

  function selectOption(option: PublicQuestion["options"][number]) {
    if (!current) return;
    setSelectedOptionId(option.id);
    setError(null);

    const nextAnswer: QuizAnswerPayload = {
      questionId: current.id,
      questionText: current.text,
      optionId: option.id,
      optionLabel: option.label,
      optionValue: option.value,
    };

    const withoutCurrent = answers.filter((a) => a.questionId !== current.id);
    const nextAnswers = [...withoutCurrent, nextAnswer];
    setAnswers(nextAnswers);

    // Tactile feedback before advancing
    setTimeout(() => {
      setSelectedOptionId(null);
      if (index < total - 1) {
        setIndex((val) => val + 1);
      } else {
        setStep("contact");
      }
    }, 180);
  }

  function goBack() {
    setError(null);
    setSelectedOptionId(null);
    if (step === "contact") {
      setStep("questions");
      setIndex(total - 1);
      return;
    }
    if (index > 0) {
      setIndex((val) => val - 1);
    }
  }

  function goNext() {
    setError(null);
    setSelectedOptionId(null);
    if (index < total - 1) {
      setIndex((val) => val + 1);
    } else {
      setStep("contact");
    }
  }

  async function submit() {
    setError(null);
    if (name.trim().length < 2) {
      setError("Por favor ingresa tu nombre completo.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    const phoneDigits = whatsapp.replace(/[^\d+]/g, "");
    const phoneOnlyDigits = phoneDigits.replace(/\D/g, "");
    if (phoneOnlyDigits.length < 8) {
      setError("Ingresa un número de WhatsApp válido (mínimo 8 dígitos).");
      return;
    }

    setStep("submitting");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          whatsapp: phoneDigits,
          answers,
        }),
        signal: controller.signal,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          data.error || data.message || "No se pudo completar el análisis",
        );
      }
      if (!data.id) {
        throw new Error("No recibimos el resultado. Intenta de nuevo.");
      }

      window.location.assign(`/resultado/${data.id}`);
    } catch (err) {
      const message =
        err instanceof Error && err.name === "AbortError"
          ? "El análisis tomó demasiado tiempo. Por favor intenta de nuevo."
          : err instanceof Error
            ? err.message
            : "Ocurrió un error inesperado al procesar tu solicitud.";
      setStep("contact");
      setError(message);
    } finally {
      clearTimeout(timeout);
    }
  }

  if (questions.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        Aún no hay preguntas activas en el sistema.
      </Card>
    );
  }

  // Submitting Screen with shadcn Card
  if (step === "submitting") {
    const loadingPhrases = [
      "Analizando las necesidades de tu piel…",
      "Consultando formulaciones botánicas Aphros…",
      "Calculando la rutina exacta para ti…",
      "Casi listo…",
    ];

    return (
      <Card className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border-border bg-linear-to-b from-card to-secondary/35 p-6 text-center shadow-xs">
        <div className="relative mb-6 flex size-20 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-2xs">
          <SparklesIcon className="size-10 animate-spin" style={{ animationDuration: "6s" }} />
          <div className="absolute inset-0 rounded-full border-2 border-secondary-foreground/40 border-t-transparent animate-spin" />
        </div>

        <Badge variant="secondary" className="uppercase tracking-[0.2em] font-semibold">
          Diagnóstico en curso
        </Badge>

        <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl text-forest sm:text-3xl">
          Personalizando tu rutina Aphros
        </h2>

        <p className="mt-3 min-h-[24px] text-sm text-mist transition-all">
          {loadingPhrases[loadingPhraseIndex]}
        </p>

        <div className="mt-8 w-52">
          <Progress value={65} className="h-2" />
        </div>
      </Card>
    );
  }

  // Contact Form Screen with shadcn Card, Fields & Buttons
  if (step === "contact") {
    return (
      <Card className="rounded-3xl border-border bg-card p-5 shadow-xs sm:p-8">
        {/* Top Navigation Bar with shadcn Button & Badge */}
        <div className="mb-4 flex items-center justify-between">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={goBack}
            className="rounded-full shadow-2xs"
          >
            <ArrowLeftIcon data-icon="inline-start" />
            <span>Regresar a preguntas</span>
          </Button>

          <Badge variant="secondary" className="font-semibold">
            Paso final
          </Badge>
        </div>

        <CardHeader className="p-0">
          <Badge variant="secondary" className="w-fit font-semibold uppercase tracking-[0.2em]">
            Tu diagnóstico está listo
          </Badge>
          <CardTitle className="mt-1 font-[family-name:var(--font-display)] text-2xl text-forest sm:text-3xl leading-tight">
            ¿A dónde enviamos tu rutina?
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm leading-relaxed">
            Verás tus resultados al instante en pantalla y recibirás un respaldo en tu correo.
          </CardDescription>
        </CardHeader>

        {/* Inputs using shadcn FieldGroup, Field and Input */}
        <CardContent className="p-0 mt-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="fullName" className="text-xs font-medium text-forest">
                Nombre completo
              </FieldLabel>
              <div className="relative flex items-center">
                <UserIcon className="pointer-events-none absolute left-3 size-4 text-mist" />
                <Input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Sofía Morales"
                  className="h-12 pl-9 text-base"
                />
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="emailAddress" className="text-xs font-medium text-forest">
                Correo electrónico
              </FieldLabel>
              <div className="relative flex items-center">
                <MailIcon className="pointer-events-none absolute left-3 size-4 text-mist" />
                <Input
                  id="emailAddress"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="h-12 pl-9 text-base"
                />
              </div>
            </Field>

            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="whatsappPhone" className="text-xs font-medium text-forest">
                  WhatsApp
                </FieldLabel>
                <span className="text-[11px] text-secondary-foreground font-medium">
                  Para asesoría directa
                </span>
              </div>
              <div className="relative flex items-center">
                <MessageCircleIcon className="pointer-events-none absolute left-3 size-4 text-primary" />
                <Input
                  id="whatsappPhone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+502 5555 5555"
                  className="h-12 pl-9 text-base"
                />
              </div>
            </Field>
          </FieldGroup>

          {error ? (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>

        {/* Action Buttons using shadcn Button */}
        <CardFooter className="p-0 mt-6 flex flex-col gap-3">
          <Button
            type="button"
            size="lg"
            onClick={submit}
            className="h-13 w-full rounded-2xl text-base font-semibold shadow-sm active:scale-[0.98]"
          >
            <span>Ver mi rutina personalizada</span>
            <ArrowRightIcon data-icon="inline-end" />
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={goBack}
            className="h-11 w-full rounded-xl text-xs font-semibold active:scale-[0.98]"
          >
            <RotateCcwIcon data-icon="inline-start" />
            <span>Revisar o cambiar respuestas</span>
          </Button>

          <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-mist">
            <LockIcon className="size-3 text-secondary-foreground" />
            <span>Tus datos son 100% confidenciales. Sin spam.</span>
          </p>
        </CardFooter>
      </Card>
    );
  }

  // Questions Screen with shadcn Card & Progress
  return (
    <Card className="rounded-3xl border-border bg-card p-5 shadow-xs sm:p-8">
      {/* Top Header Bar with shadcn Button and Badge */}
      <div className="mb-4 flex items-center justify-between">
        {index > 0 ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={goBack}
            className="rounded-full shadow-2xs font-medium"
          >
            <ArrowLeftIcon data-icon="inline-start" />
            <span>Anterior</span>
          </Button>
        ) : (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-full font-medium text-mist"
          >
            <Link href="/">
              <ArrowLeftIcon data-icon="inline-start" />
              <span>Inicio</span>
            </Link>
          </Button>
        )}

        <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold">
          {index + 1} de {total}
        </Badge>
      </div>

      {/* Progress Bar using shadcn Progress */}
      <div className="mb-6">
        <Progress value={progressPercent} className="h-1.5 w-full" />
      </div>

      {/* Question Title */}
      <CardHeader className="p-0 mb-6">
        <CardTitle className="font-[family-name:var(--font-display)] text-2xl font-medium leading-snug text-forest sm:text-3xl">
          {current.text}
        </CardTitle>
        <CardDescription className="mt-1 text-xs text-mist">
          Selecciona una opción para avanzar (puedes regresar en cualquier momento):
        </CardDescription>
      </CardHeader>

      {/* Option Cards: large tap targets for mobile thumbs */}
      <CardContent className="p-0">
        <div className="flex flex-col gap-2.5">
          {current.options.map((option) => {
            const isSelected =
              selectedOptionId === option.id ||
              (!selectedOptionId && currentAnswer?.optionId === option.id);

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => selectOption(option)}
                className={`group flex min-h-[58px] w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left text-sm font-medium transition-all duration-150 active:scale-[0.98] ${
                  isSelected
                    ? "border-primary bg-secondary/80 text-secondary-foreground shadow-2xs font-semibold"
                    : "border-border bg-background/80 text-foreground hover:border-primary/60 hover:bg-card"
                }`}
              >
                <span className="pr-3 leading-snug">{option.label}</span>
                <div
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card group-hover:border-primary/60"
                  }`}
                >
                  {isSelected ? <CheckIcon className="size-3" /> : null}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>

      {/* Bottom Navigation Row using shadcn Buttons */}
      <CardFooter className="p-0 mt-6 flex items-center justify-between border-t border-border/60 pt-4">
        {index > 0 ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={goBack}
            className="rounded-xl font-medium"
          >
            <ArrowLeftIcon data-icon="inline-start" />
            <span>Pregunta anterior</span>
          </Button>
        ) : (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl font-medium"
          >
            <Link href="/">
              <ArrowLeftIcon data-icon="inline-start" />
              <span>Volver al inicio</span>
            </Link>
          </Button>
        )}

        {hasCurrentAnswer ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={goNext}
            className="rounded-xl font-semibold"
          >
            <span>{index === total - 1 ? "Continuar" : "Siguiente"}</span>
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}

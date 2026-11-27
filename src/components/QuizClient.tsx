"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  LockIcon,
  MailIcon,
  MessageCircleIcon,
  UserIcon,
} from "lucide-react";
import type { PublicQuestion, QuizAnswerPayload } from "@/lib/types";
import { AphrosShellMark } from "@/components/AphrosShellMark";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

type Step = "questions" | "contact" | "submitting";
type Direction = "forward" | "back";

const LOADING_PHRASES = [
  "Analizando las necesidades de tu piel…",
  "Consultando formulaciones naturales Aphros…",
  "Diseñando tu ritual de amor propio…",
  "Casi listo…",
];

export function QuizClient({ questions }: { questions: PublicQuestion[] }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("questions");
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<Direction>("forward");
  const [answers, setAnswers] = useState<QuizAnswerPayload[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);

  const current = questions[index];
  const total = questions.length;
  const progressPercent =
    total === 0 ? 0 : Math.round(((index + 1) / total) * 100);

  const currentAnswer = current
    ? answers.find((a) => a.questionId === current.id)
    : undefined;
  const hasCurrentAnswer = Boolean(currentAnswer);

  useEffect(() => {
    if (step !== "submitting") return;
    const timer = setInterval(() => {
      setLoadingPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
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

    setTimeout(() => {
      setSelectedOptionId(null);
      setDirection("forward");
      if (index < total - 1) {
        setIndex((val) => val + 1);
      } else {
        setStep("contact");
      }
    }, 240);
  }

  function goBack() {
    setError(null);
    setSelectedOptionId(null);
    setDirection("back");
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
    setDirection("forward");
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

      const resultId = data.id;
      router.push(`/resultado/${resultId}`);
      // Limpiar estado para que al regresar a /quiz esté en la primera pregunta
      setStep("questions");
      setIndex(0);
      setAnswers([]);
      setSelectedOptionId(null);
      setError(null);
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
      <Card className="rounded-[2rem] border-border/80 bg-card/95 p-8 text-center text-muted-foreground shadow-xs ring-0">
        Aún no hay preguntas activas en el sistema.
      </Card>
    );
  }

  // Pantalla de análisis editorial
  if (step === "submitting") {
    return (
      <Card className="fade-up aphros-editorial-dark relative flex min-h-[440px] flex-col items-center justify-center overflow-hidden rounded-[2rem] border-0 p-8 text-center text-aphros-blush-100 shadow-lg ring-0">
        <div className="relative mb-7 flex size-24 items-center justify-center rounded-full bg-aphros-blush-100/10 text-aphros-blush-100 backdrop-blur-xs">
          <AphrosShellMark
            variant="light"
            className="aphros-shell-breathe h-12 w-16"
          />
          <div
            className="absolute inset-0 rounded-full border border-aphros-blush-200/35 border-t-aphros-blush-100 animate-spin"
            style={{ animationDuration: "3.2s" }}
          />
        </div>

        <span className="text-[11px] font-medium tracking-[0.24em] text-aphros-blush-200/90 uppercase">
          Diagnóstico en curso
        </span>

        <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-normal text-aphros-blush-50 sm:text-3xl">
          Creando tu ritual{" "}
          <span className="italic text-aphros-blush-200">Aphros</span>
        </h2>

        <p
          key={loadingPhraseIndex}
          className="fade-up mt-3 min-h-[24px] text-xs font-light text-aphros-blush-200/85 sm:text-sm"
        >
          {LOADING_PHRASES[loadingPhraseIndex]}
        </p>

        <div className="mt-8 w-52">
          <Progress
            value={Math.min(92, 32 + loadingPhraseIndex * 20)}
            className="h-1.5 bg-aphros-blush-100/15 [&_[data-slot=progress-indicator]]:bg-aphros-blush-200"
          />
        </div>

        <div
          aria-hidden="true"
          className="aphros-watermark pointer-events-none absolute -bottom-4 left-1/2 -translate-x-1/2 font-[family-name:var(--font-display)] text-6xl text-aphros-blush-100/[0.06]"
        >
          APHROS
        </div>
      </Card>
    );
  }

  // Pantalla de contacto final
  if (step === "contact") {
    return (
      <Card className="aphros-step-in rounded-[2rem] border-border/80 bg-card/95 shadow-xs ring-0 [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]">
        <CardHeader className="gap-3.5">
          <div className="flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={goBack}
              className="rounded-full px-3.5 text-xs font-medium shadow-2xs transition-colors"
            >
              <ArrowLeftIcon data-icon="inline-start" />
              <span>Regresar</span>
            </Button>

            <Badge
              variant="secondary"
              className="h-auto rounded-full px-3.5 py-1 text-[11px] font-medium tracking-wide text-aphros-wine"
            >
              Paso final
            </Badge>
          </div>

          <Progress value={100} className="h-1.5 w-full" />

          <div className="mt-1 flex flex-col gap-1.5">
            <span className="text-[11px] font-medium tracking-[0.22em] text-aphros-rose-deep uppercase">
              Tu diagnóstico está listo
            </span>
            <CardTitle className="font-[family-name:var(--font-display)] text-2xl font-normal leading-tight text-aphros-espresso sm:text-3xl">
              ¿A dónde enviamos tu{" "}
              <span className="italic text-aphros-wine">rutina?</span>
            </CardTitle>
            <CardDescription className="text-xs font-light leading-relaxed sm:text-sm">
              Verás tus resultados al instante en pantalla y recibirás un
              respaldo en tu correo.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel
                htmlFor="fullName"
                className="text-xs font-medium text-aphros-espresso"
              >
                Nombre completo
              </FieldLabel>
              <div className="relative flex items-center">
                <UserIcon className="pointer-events-none absolute left-3.5 size-4 text-aphros-rose-deep" />
                <Input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Sofía Morales"
                  className="h-11 rounded-2xl border-border/90 bg-aphros-blush-50/50 pl-10 text-sm transition-colors focus-visible:border-aphros-rose focus-visible:bg-card sm:text-base"
                />
              </div>
            </Field>

            <Field>
              <FieldLabel
                htmlFor="emailAddress"
                className="text-xs font-medium text-aphros-espresso"
              >
                Correo electrónico
              </FieldLabel>
              <div className="relative flex items-center">
                <MailIcon className="pointer-events-none absolute left-3.5 size-4 text-aphros-rose-deep" />
                <Input
                  id="emailAddress"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="h-11 rounded-2xl border-border/90 bg-aphros-blush-50/50 pl-10 text-sm transition-colors focus-visible:border-aphros-rose focus-visible:bg-card sm:text-base"
                />
              </div>
            </Field>

            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel
                  htmlFor="whatsappPhone"
                  className="text-xs font-medium text-aphros-espresso"
                >
                  WhatsApp
                </FieldLabel>
                <span className="text-[11px] font-medium text-aphros-rose-deep">
                  Para asesoría directa
                </span>
              </div>
              <div className="relative flex items-center">
                <MessageCircleIcon className="pointer-events-none absolute left-3.5 size-4 text-aphros-wine" />
                <Input
                  id="whatsappPhone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+502 5422 2180"
                  className="h-11 rounded-2xl border-border/90 bg-aphros-blush-50/50 pl-10 text-sm transition-colors focus-visible:border-aphros-rose focus-visible:bg-card sm:text-base"
                />
              </div>
            </Field>
          </FieldGroup>

          {error ? (
            <Alert variant="destructive" className="fade-up rounded-2xl">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-col gap-2.5 pt-2">
            <Button
              type="button"
              size="lg"
              onClick={submit}
              className="aphros-btn-luxury group h-12 w-full rounded-full text-sm font-medium tracking-wide shadow-sm sm:text-base"
            >
              <span>Ver mi rutina personalizada</span>
              <ArrowRightIcon
                data-icon="inline-end"
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Button>

            <p className="flex items-center justify-center gap-1.5 pt-1 text-center text-[11px] font-light text-mist">
              <LockIcon className="size-3 text-aphros-rose-deep" />
              <span>Tus datos son 100% confidenciales. Sin spam.</span>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Pantalla de preguntas con transición direccional suave
  return (
    <Card className="rounded-[2rem] border-border/80 bg-card/95 shadow-sm ring-0 [--card-spacing:--spacing(5)] sm:[--card-spacing:--spacing(7)]">
      <CardHeader className="gap-3.5">
        <div className="flex items-center justify-between gap-2">
          {index > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="-ml-2 rounded-full px-3 text-xs font-medium text-mist hover:bg-secondary/70 hover:text-aphros-espresso"
            >
              <ArrowLeftIcon data-icon="inline-start" className="size-3.5" />
              <span>Anterior</span>
            </Button>
          ) : (
            <span className="text-[10px] font-medium tracking-[0.24em] text-aphros-rose-deep uppercase">
              Diagnóstico Aphros
            </span>
          )}

          <Badge
            variant="secondary"
            className="h-auto rounded-full px-3 py-1 text-[11px] font-medium text-aphros-wine"
          >
            {index + 1} de {total}
          </Badge>
        </div>

        <Progress value={progressPercent} className="h-1.5 w-full" />

        <div
          key={`q-head-${current.id}`}
          className={`pt-1 ${
            direction === "forward" ? "aphros-step-in" : "aphros-step-back"
          }`}
        >
          <CardTitle className="font-[family-name:var(--font-display)] text-2xl font-normal leading-snug text-aphros-espresso sm:text-[1.75rem]">
            {current.text}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div
          key={`q-opts-${current.id}`}
          className={`flex flex-col gap-2.5 ${
            direction === "forward" ? "aphros-step-in" : "aphros-step-back"
          }`}
        >
          {current.options.map((option, optIdx) => {
            const isSelected =
              selectedOptionId === option.id ||
              (!selectedOptionId && currentAnswer?.optionId === option.id);
            const letter = String.fromCharCode(65 + optIdx);

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => selectOption(option)}
                className={`group flex min-h-[52px] w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.985] ${
                  isSelected
                    ? "border-aphros-wine bg-aphros-blush-100/95 font-medium text-aphros-wine shadow-2xs"
                    : "border-aphros-espresso/14 bg-aphros-blush-50/45 font-normal text-aphros-espresso hover:-translate-y-0.5 hover:border-aphros-rose hover:bg-card hover:shadow-xs"
                }`}
              >
                <div className="flex items-center gap-3 pr-3">
                  <span
                    className={`flex size-6.5 shrink-0 items-center justify-center rounded-full font-[family-name:var(--font-display)] text-xs transition-colors duration-300 ${
                      isSelected
                        ? "bg-aphros-wine text-aphros-blush-50"
                        : "bg-aphros-blush-200/75 text-aphros-cocoa group-hover:bg-aphros-rose/25 group-hover:text-aphros-wine"
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="leading-snug">{option.label}</span>
                </div>
                <div
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                    isSelected
                      ? "border-aphros-wine bg-aphros-wine text-aphros-blush-50"
                      : "border-aphros-blush-300 bg-card group-hover:border-aphros-rose"
                  }`}
                >
                  {isSelected ? (
                    <CheckIcon className="aphros-pop size-3" />
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

        {hasCurrentAnswer ? (
          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={goNext}
              className="h-9 rounded-full px-4 text-xs font-medium text-aphros-wine"
            >
              <span>{index === total - 1 ? "Continuar" : "Siguiente"}</span>
              <ArrowRightIcon data-icon="inline-end" className="size-3.5" />
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

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
      <div className="rounded-3xl border border-sand bg-cream/90 p-6 text-center text-mist">
        Aún no hay preguntas activas en el sistema.
      </div>
    );
  }

  // Submitting Screen
  if (step === "submitting") {
    const loadingPhrases = [
      "Analizando las necesidades de tu piel…",
      "Consultando formulaciones botánicas Aphros…",
      "Calculando la rutina exacta para ti…",
      "Casi listo…",
    ];

    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-sand bg-cream/95 p-6 text-center shadow-xs">
        <div className="relative mb-6 flex size-20 items-center justify-center rounded-full bg-sage/15 text-sage">
          <SparklesIcon className="size-10 animate-spin transition-all" style={{ animationDuration: "6s" }} />
          <div className="absolute inset-0 rounded-full border-2 border-sage border-t-transparent animate-spin" />
        </div>

        <p className="text-xs font-semibold tracking-[0.25em] uppercase text-sage">
          Diagnóstico en curso
        </p>

        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-forest sm:text-3xl">
          Personalizando tu rutina Aphros
        </h2>

        <p className="mt-3 min-h-[24px] text-sm text-mist transition-all">
          {loadingPhrases[loadingPhraseIndex]}
        </p>

        <div className="mt-8 h-2 w-52 overflow-hidden rounded-full bg-sand">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-sage" />
        </div>
      </div>
    );
  }

  // Contact Form Screen
  if (step === "contact") {
    return (
      <div className="flex flex-col rounded-3xl border border-sand bg-cream/95 p-5 shadow-xs sm:p-8">
        {/* Top Navigation Bar */}
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1.5 rounded-full border border-sand/80 bg-background/80 px-3 py-1.5 text-xs font-medium text-forest hover:bg-cream active:scale-95 transition"
          >
            <ArrowLeftIcon className="size-3.5" />
            <span>← Regresar a preguntas</span>
          </button>
          <span className="text-xs font-medium text-sage">Paso final</span>
        </div>

        <div>
          <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-sage">
            Tu diagnóstico está listo
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-forest sm:text-3xl leading-tight">
            ¿A dónde enviamos tu rutina?
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-mist leading-relaxed">
            Verás tus resultados al instante en pantalla y recibirás un respaldo en tu correo.
          </p>
        </div>

        {/* Inputs */}
        <div className="mt-6 flex flex-col gap-3.5">
          <div>
            <label className="mb-1 block text-xs font-medium text-forest">
              Nombre completo
            </label>
            <div className="relative flex items-center">
              <UserIcon className="pointer-events-none absolute left-3.5 size-4 text-mist" />
              <input
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Sofía Morales"
                className="h-13 w-full rounded-2xl border border-sand bg-background/90 pl-10 pr-4 text-base text-forest outline-none transition focus:border-sage focus:ring-2 focus:ring-sage/20 placeholder:text-mist/60"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-forest">
              Correo electrónico
            </label>
            <div className="relative flex items-center">
              <MailIcon className="pointer-events-none absolute left-3.5 size-4 text-mist" />
              <input
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="h-13 w-full rounded-2xl border border-sand bg-background/90 pl-10 pr-4 text-base text-forest outline-none transition focus:border-sage focus:ring-2 focus:ring-sage/20 placeholder:text-mist/60"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 flex items-center justify-between text-xs font-medium text-forest">
              <span>WhatsApp</span>
              <span className="text-[11px] text-sage font-normal">Para asesoría directa</span>
            </label>
            <div className="relative flex items-center">
              <MessageCircleIcon className="pointer-events-none absolute left-3.5 size-4 text-emerald-600 dark:text-emerald-400" />
              <input
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+502 5555 5555"
                className="h-13 w-full rounded-2xl border border-sand bg-background/90 pl-10 pr-4 text-base text-forest outline-none transition focus:border-sage focus:ring-2 focus:ring-sage/20 placeholder:text-mist/60"
              />
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50/80 p-3 text-xs text-red-700">
            {error}
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={submit}
            className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-sage text-base font-semibold text-cream shadow-sm transition hover:bg-sage-dark active:scale-[0.98]"
          >
            <span>Ver mi rutina personalizada</span>
            <ArrowRightIcon className="size-4" />
          </button>

          <button
            type="button"
            onClick={goBack}
            className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-sand/80 bg-background/70 text-xs font-medium text-mist hover:text-forest transition active:scale-[0.98]"
          >
            <RotateCcwIcon className="size-3.5" />
            <span>Revisar o cambiar respuestas</span>
          </button>

          <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-mist">
            <LockIcon className="size-3 text-sage" />
            <span>Tus datos son 100% confidenciales. Sin spam.</span>
          </p>
        </div>
      </div>
    );
  }

  // Questions Screen
  return (
    <div className="flex flex-col rounded-3xl border border-sand bg-cream/95 p-5 shadow-xs sm:p-8">
      {/* Top Header Bar */}
      <div className="mb-4 flex items-center justify-between">
        {index > 0 ? (
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1.5 rounded-full border border-sand/80 bg-background/80 px-3 py-1.5 text-xs font-medium text-forest hover:bg-cream active:scale-95 transition"
          >
            <ArrowLeftIcon className="size-3.5 text-sage" />
            <span>Anterior</span>
          </button>
        ) : (
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-sand/80 bg-background/80 px-3 py-1.5 text-xs font-medium text-mist hover:text-forest active:scale-95 transition"
          >
            <ArrowLeftIcon className="size-3.5 text-mist" />
            <span>Inicio</span>
          </Link>
        )}

        <span className="rounded-full bg-sand/60 px-3 py-1 text-xs font-semibold text-forest">
          {index + 1} de {total}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-sand/60">
        <div
          className="h-full rounded-full bg-sage transition-all duration-300 ease-out"
          style={{ width: `${Math.max(progressPercent, 6)}%` }}
        />
      </div>

      {/* Question Title */}
      <div className="mb-6">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-medium leading-snug text-forest sm:text-3xl">
          {current.text}
        </h2>
        <p className="mt-1 text-xs text-mist">
          Selecciona una opción para avanzar (puedes regresar en cualquier momento):
        </p>
      </div>

      {/* Option Cards: large tap targets for mobile thumbs */}
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
                  ? "border-sage bg-sage/12 text-forest shadow-2xs font-semibold"
                  : "border-sand bg-background/80 text-forest hover:border-sage/60 hover:bg-cream"
              }`}
            >
              <span className="pr-3 leading-snug">{option.label}</span>
              <div
                className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                  isSelected
                    ? "border-sage bg-sage text-cream"
                    : "border-sand bg-cream group-hover:border-sage/60"
                }`}
              >
                {isSelected ? <CheckIcon className="size-3" /> : null}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Navigation Row */}
      <div className="mt-6 flex items-center justify-between border-t border-sand/60 pt-4">
        {index > 0 ? (
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1.5 rounded-xl border border-sand bg-background/90 px-4 py-2.5 text-xs font-medium text-forest hover:bg-cream active:scale-95 transition"
          >
            <ArrowLeftIcon className="size-3.5 text-sage" />
            <span>Pregunta anterior</span>
          </button>
        ) : (
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-sand bg-background/90 px-4 py-2.5 text-xs font-medium text-mist hover:text-forest active:scale-95 transition"
          >
            <ArrowLeftIcon className="size-3.5" />
            <span>Volver al inicio</span>
          </Link>
        )}

        {hasCurrentAnswer ? (
          <button
            type="button"
            onClick={goNext}
            className="inline-flex items-center gap-1.5 rounded-xl bg-sage/15 px-4 py-2.5 text-xs font-semibold text-sage-dark hover:bg-sage/25 active:scale-95 transition"
          >
            <span>{index === total - 1 ? "Continuar" : "Siguiente"}</span>
            <ArrowRightIcon className="size-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

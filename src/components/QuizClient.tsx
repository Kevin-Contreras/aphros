"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PublicQuestion, QuizAnswerPayload } from "@/lib/types";

type Step = "questions" | "contact" | "submitting";

export function QuizClient({ questions }: { questions: PublicQuestion[] }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("questions");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswerPayload[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const current = questions[index];
  const progress =
    questions.length === 0 ? 0 : Math.round((index / questions.length) * 100);

  useEffect(() => {
    setError(null);
  }, [index, step]);

  function selectOption(option: PublicQuestion["options"][number]) {
    if (!current) return;

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

    if (index < questions.length - 1) {
      setIndex((value) => value + 1);
      return;
    }

    setStep("contact");
  }

  function submit() {
    setError(null);
    if (name.trim().length < 2) {
      setError("Escribe tu nombre.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Escribe un correo válido.");
      return;
    }

    setStep("submitting");
    startTransition(async () => {
      try {
        const response = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), email: email.trim(), answers }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "No se pudo completar el análisis");
        }
        router.push(`/resultado/${data.id}`);
      } catch (err) {
        setStep("contact");
        setError(err instanceof Error ? err.message : "Error inesperado");
      }
    });
  }

  if (questions.length === 0) {
    return (
      <p className="rounded-2xl border border-sand bg-cream/80 p-6 text-mist">
        Aún no hay preguntas activas. Vuelve pronto.
      </p>
    );
  }

  if (step === "submitting" || isPending) {
    return (
      <div className="rounded-3xl border border-sand bg-cream/90 p-10 text-center shadow-sm">
        <p className="text-xs tracking-[0.25em] uppercase text-sage">Aphros</p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-forest">
          Analizando tu piel…
        </h2>
        <p className="mt-3 text-sm text-mist">
          Estamos preparando tu rutina personalizada.
        </p>
      </div>
    );
  }

  if (step === "contact") {
    return (
      <div className="rounded-3xl border border-sand bg-cream/90 p-8 shadow-sm md:p-10">
        <p className="text-xs tracking-[0.25em] uppercase text-sage">Último paso</p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-forest">
          ¿Dónde te enviamos tu rutina?
        </h2>
        <p className="mt-2 text-sm text-mist">
          Verás el resultado en pantalla y también llegará a tu correo.
        </p>

        <div className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm text-forest">Nombre</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-sand bg-ivory/60 px-4 py-3 text-forest outline-none focus:border-sage"
              placeholder="Tu nombre"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-forest">Correo</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-sand bg-ivory/60 px-4 py-3 text-forest outline-none focus:border-sage"
              placeholder="tu@correo.com"
            />
          </label>
        </div>

        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setStep("questions");
              setIndex(questions.length - 1);
            }}
            className="rounded-full border border-sand px-5 py-2.5 text-sm text-forest"
          >
            Volver
          </button>
          <button
            type="button"
            onClick={submit}
            className="rounded-full bg-sage px-6 py-2.5 text-sm font-semibold text-cream hover:bg-sage-dark"
          >
            Ver mi rutina
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-sand bg-cream/90 p-8 shadow-sm md:p-10">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs text-mist">
          <span>
            Pregunta {index + 1} de {questions.length}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-sand">
          <div
            className="h-full rounded-full bg-sage transition-all duration-500"
            style={{ width: `${Math.max(progress, 8)}%` }}
          />
        </div>
      </div>

      <h2 className="font-[family-name:var(--font-display)] text-3xl leading-tight text-forest md:text-4xl">
        {current.text}
      </h2>

      <div className="mt-8 grid gap-3">
        {current.options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => selectOption(option)}
            className="rounded-2xl border border-sand bg-ivory/50 px-5 py-4 text-left text-sm text-forest transition hover:border-sage hover:bg-cream"
          >
            {option.label}
          </button>
        ))}
      </div>

      {index > 0 ? (
        <button
          type="button"
          onClick={() => setIndex((value) => value - 1)}
          className="mt-6 text-sm text-mist hover:text-forest"
        >
          ← Pregunta anterior
        </button>
      ) : null}
    </div>
  );
}

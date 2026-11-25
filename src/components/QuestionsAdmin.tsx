"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";

type Option = {
  id?: string;
  label: string;
  value: string;
  order: number;
};

type Question = {
  id: string;
  text: string;
  order: number;
  active: boolean;
  options: Option[];
};

const emptyForm = {
  text: "",
  order: "0",
  active: true,
  options: [
    { label: "", value: "", order: 1 },
    { label: "", value: "", order: 2 },
  ] as Option[],
};

export function QuestionsAdmin() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function load() {
    const response = await fetch("/api/admin/questions");
    if (!response.ok) throw new Error("No se pudieron cargar preguntas");
    setQuestions(await response.json());
  }

  useEffect(() => {
    startTransition(async () => {
      try {
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar");
      }
    });
  }, []);

  function startEdit(question: Question) {
    setEditingId(question.id);
    setForm({
      text: question.text,
      order: String(question.order),
      active: question.active,
      options: question.options.map((option, index) => ({
        label: option.label,
        value: option.value,
        order: option.order || index + 1,
      })),
    });
    setError(null);
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  }

  function updateOption(index: number, key: keyof Option, value: string | number) {
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((option, i) =>
        i === index ? { ...option, [key]: value } : option,
      ),
    }));
  }

  function addOption() {
    setForm((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        { label: "", value: "", order: prev.options.length + 1 },
      ],
    }));
  }

  function removeOption(index: number) {
    setForm((prev) => ({
      ...prev,
      options: prev.options
        .filter((_, i) => i !== index)
        .map((option, i) => ({ ...option, order: i + 1 })),
    }));
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const order = Number(form.order);
    if (!Number.isFinite(order)) {
      setError("El orden debe ser un número.");
      return;
    }

    const options = form.options
      .map((option, index) => ({
        label: option.label.trim(),
        value: option.value.trim(),
        order: option.order || index + 1,
      }))
      .filter((option) => option.label && option.value);

    if (options.length < 2) {
      setError("Agrega al menos dos opciones.");
      return;
    }

    const payload = {
      text: form.text.trim(),
      order,
      active: form.active,
      options,
    };

    startTransition(async () => {
      try {
        const response = await fetch(
          editingId ? `/api/admin/questions/${editingId}` : "/api/admin/questions",
          {
            method: editingId ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            typeof data.error === "string" ? data.error : "No se pudo guardar",
          );
        }
        resetForm();
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al guardar");
      }
    });
  }

  function remove(id: string) {
    if (!confirm("¿Eliminar esta pregunta?")) return;
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/questions/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("No se pudo eliminar");
        if (editingId === id) resetForm();
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al eliminar");
      }
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-forest">
          Preguntas
        </h1>
        <p className="mt-2 text-sm text-mist">
          Define el cuestionario que verán las personas en /quiz.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border border-sand bg-cream p-5"
      >
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-forest">
          {editingId ? "Editar pregunta" : "Nueva pregunta"}
        </h2>

        <label className="block text-sm">
          <span className="mb-1.5 block text-forest">Texto</span>
          <textarea
            value={form.text}
            onChange={(e) => setForm((prev) => ({ ...prev, text: e.target.value }))}
            rows={2}
            className="w-full rounded-xl border border-sand bg-ivory/70 px-3 py-2 outline-none focus:border-sage"
            required
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1.5 block text-forest">Orden</span>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm((prev) => ({ ...prev, order: e.target.value }))}
              className="w-full rounded-xl border border-sand bg-ivory/70 px-3 py-2 outline-none focus:border-sage"
              required
            />
          </label>
          <label className="flex items-end gap-2 pb-2 text-sm text-forest">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, active: e.target.checked }))
              }
            />
            Activa en el quiz
          </label>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-forest">Opciones</p>
              <p className="text-xs text-mist">
                Izquierda = texto del quiz · Derecha = tags para la IA (igual que
                skinTags de productos, ej. <code>grasa,acne</code>)
              </p>
            </div>
            <button
              type="button"
              onClick={addOption}
              className="shrink-0 text-xs text-sage hover:text-sage-dark"
            >
              + Agregar opción
            </button>
          </div>
          {form.options.map((option, index) => (
            <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <input
                placeholder="Lo que ve la persona"
                value={option.label}
                onChange={(e) => updateOption(index, "label", e.target.value)}
                className="rounded-xl border border-sand bg-ivory/70 px-3 py-2 text-sm outline-none focus:border-sage"
                required
              />
              <input
                placeholder="Tags IA: grasa,acne"
                value={option.value}
                onChange={(e) => updateOption(index, "value", e.target.value)}
                className="rounded-xl border border-sand bg-ivory/70 px-3 py-2 text-sm outline-none focus:border-sage"
                required
              />
              <button
                type="button"
                onClick={() => removeOption(index)}
                disabled={form.options.length <= 2}
                className="rounded-xl border border-sand px-3 py-2 text-xs text-mist disabled:opacity-40"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>

        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-full bg-sage px-5 py-2.5 text-sm font-semibold text-cream hover:bg-sage-dark disabled:opacity-60"
          >
            {isPending ? "Guardando…" : editingId ? "Actualizar" : "Crear"}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-sand px-5 py-2.5 text-sm text-mist hover:border-sage"
            >
              Cancelar
            </button>
          ) : null}
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-sand bg-cream">
        {questions.length === 0 ? (
          <p className="p-5 text-sm text-mist">No hay preguntas todavía.</p>
        ) : (
          <ul className="divide-y divide-sand">
            {questions.map((question) => (
              <li
                key={question.id}
                className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-start md:justify-between"
              >
                <div>
                  <p className="font-medium text-forest">
                    #{question.order} {question.text}{" "}
                    <span className="text-xs font-normal text-mist">
                      {question.active ? "activa" : "inactiva"}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-mist">
                    {question.options.map((o) => o.label).join(" · ")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(question)}
                    className="rounded-full border border-sand px-3 py-1.5 text-xs text-forest hover:border-sage"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(question.id)}
                    className="rounded-full border border-sand px-3 py-1.5 text-xs text-red-700 hover:border-red-300"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

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
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-3xl border border-sand bg-cream p-8 shadow-sm"
      >
        <p className="text-xs tracking-[0.28em] uppercase text-sage">Aphros</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-forest">
          Acceso admin
        </h1>
        <p className="mt-2 text-sm text-mist">
          Ingresa la contraseña definida en tu archivo .env
        </p>

        <label className="mt-8 block">
          <span className="mb-1.5 block text-sm text-forest">Contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-sand bg-ivory/70 px-4 py-3 outline-none focus:border-sage"
            required
          />
        </label>

        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}

        <button
          type="submit"
          disabled={isPending}
          className="mt-6 w-full rounded-full bg-sage py-3 text-sm font-semibold text-cream hover:bg-sage-dark disabled:opacity-60"
        >
          {isPending ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}

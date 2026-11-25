import { Suspense } from "react";
import { AdminNav } from "@/components/AdminNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      <Suspense
        fallback={
          <aside className="border-b border-sand bg-cream/90 px-5 py-6 md:min-h-screen md:w-60 md:border-b-0 md:border-r">
            <p className="text-[11px] tracking-[0.28em] uppercase text-sage">Aphros</p>
            <h1 className="font-[family-name:var(--font-display)] text-2xl text-forest">
              Dashboard
            </h1>
          </aside>
        }
      >
        <AdminNav />
      </Suspense>
      <div className="flex-1 px-5 py-8 md:px-8">{children}</div>
    </div>
  );
}

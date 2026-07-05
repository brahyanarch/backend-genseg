import type { Metadata } from "next";

import { logoutAction } from "@/app/actions/auth.actions";

export const metadata: Metadata = {
  title: "Intranet",
};

export default function IntranetPage() {
  return (
    <main className="flex flex-1 flex-col p-8">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Intranet</h1>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-lg border border-black/15 px-3 py-1.5 text-sm transition-colors hover:bg-black/[0.04] dark:border-white/15 dark:hover:bg-white/[0.06]"
          >
            Cerrar sesión
          </button>
        </form>
      </header>

      {/* Placeholder: aquí irá el contenido de la intranet más adelante. */}
      <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">
        Bienvenido a la intranet.
      </p>
    </main>
  );
}

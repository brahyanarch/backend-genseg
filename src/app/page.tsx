import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">GenSeg</h1>
        <p className="max-w-md text-zinc-500 dark:text-zinc-400">
          Zona pública. Accede a la intranet para gestionar tu oficina.
        </p>
      </div>
      <Link
        href="/login"
        className="rounded-lg bg-zinc-900 px-5 py-2.5 font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Iniciar sesión
      </Link>
    </main>
  );
}

import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { authContainer } from "@/modules/auth/config/container";
import { IntranetShell } from "./components/intranet-shell";

/**
 * Layout de la intranet (Server Component).
 *
 * Resuelve el usuario logueado en el servidor a partir de la cookie httpOnly
 * (endpoint `/me`). Si no hay sesión válida redirige al login; en caso
 * contrario hidrata el shell cliente con el usuario ya cargado. El proxy
 * (`src/proxy.ts`) ya bloquea el acceso, esto es la segunda barrera y la
 * fuente de datos del usuario.
 */
export default async function IntranetLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await authContainer.getCurrentUser.execute();
  const session = await authContainer.getSession.execute();

  if (!user) {
    redirect("/login");
  }

  return <IntranetShell user={user} activeProfileId={session?.activeProfileId ?? null}>{children}</IntranetShell>;
}

"use server";

import { redirect } from "next/navigation";

import { authContainer } from "@/modules/auth/config/container";
import {
  AuthenticationUnavailableError,
  InvalidCredentialsError,
} from "@/modules/auth/domain/errors";
import type { LoginFormState } from "./auth.types";

/**
 * Server Action de login para `useActionState`.
 *
 * - Sin `idActiveProfile`: paso 1. Si hay varios perfiles devuelve el selector;
 *   si hay uno solo, inicia sesión y redirige.
 * - Con `idActiveProfile`: paso 2. Inicia sesión con ese perfil y redirige.
 */
export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const email = String(formData.get("cEmail") ?? "").trim();
  const password = String(formData.get("cPassword") ?? "");
  const rawProfile = formData.get("idActiveProfile");

  if (!email || !password) {
    return { status: "error", message: "Ingresa tu correo y contraseña" };
  }

  const credentials = { email, password };

  try {
    if (rawProfile != null && rawProfile !== "") {
      await authContainer.selectProfile.execute(credentials, Number(rawProfile));
    } else {
      const result = await authContainer.login.execute(credentials);
      if (result.status === "profile-selection-required") {
        return {
          status: "select",
          profiles: result.user.profiles.map((p) => ({
            id: p.id,
            roleName: p.roleName,
            officeName: p.officeName,
          })),
        };
      }
    }
  } catch (error) {
    if (
      error instanceof InvalidCredentialsError ||
      error instanceof AuthenticationUnavailableError
    ) {
      return { status: "error", message: error.message };
    }
    throw error;
  }

  // Fuera del try/catch: redirect() funciona lanzando una excepción interna.
  redirect("/intranet");
}

/** Server Action de cierre de sesión. */
export async function logoutAction(): Promise<void> {
  await authContainer.logout.execute();
  redirect("/login");
}

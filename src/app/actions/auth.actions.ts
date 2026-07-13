"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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
export async function switchProfileAction(profileId: number): Promise<void> {
  await authContainer.switchProfile.execute(profileId);
  revalidatePath("/intranet", "layout");
}

export async function getUsersAction(
  page: number, 
  limit: number, 
  search?: string, 
  filters?: Record<string, string | boolean>
) {
  const { cookies } = await import("next/headers");
  const token = (await cookies()).get("session")?.value;

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) params.set("search", search);
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.set(key, value.toString());
      }
    });
  }

  const res = await fetch(`${process.env.API_BASE_URL}/v1/auth/users?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  return res.json();
}

export async function updateProfileStatusAction(
  userId: number,
  lActivo: boolean
) {
  const { cookies } = await import("next/headers");
  const token = (await cookies()).get("session")?.value;

  const res = await fetch(
    `${process.env.API_BASE_URL}/v1/auth/profiles/${userId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ lActivo }),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("No se pudo actualizar el estado del perfil");
  }

  // Eliminamos revalidatePath para no forzar recarga
  return { success: true };
}

/** Server Action de cierre de sesión. */
export async function logoutAction(): Promise<void> {
// ...

  await authContainer.logout.execute();
  redirect("/login");
}

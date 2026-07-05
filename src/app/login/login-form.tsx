"use client";

import { useActionState, useState } from "react";

import { loginAction } from "@/app/actions/auth.actions";
import { initialLoginState } from "@/app/actions/auth.types";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialLoginState,
  );

  // Credenciales controladas: persisten entre el paso 1 y el paso 2
  // (el backend vuelve a pedir la contraseña al elegir perfil).
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Permite volver al formulario de credenciales tras ver el selector.
  const [forceCredentials, setForceCredentials] = useState(false);

  const selecting = state.status === "select" && !forceCredentials;

  return (
    <form
      action={formAction}
      onSubmit={() => setForceCredentials(false)}
      className="flex w-full max-w-sm flex-col gap-5 rounded-2xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-zinc-900"
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">
          {selecting ? "Elige tu perfil" : "Iniciar sesión"}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {selecting
            ? "Tienes varios perfiles. Selecciona con cuál ingresar."
            : "Ingresa tus credenciales para continuar."}
        </p>
      </div>

      {selecting ? (
        <>
          {/* Reenviamos las credenciales junto con el perfil elegido. */}
          <input type="hidden" name="cEmail" value={email} />
          <input type="hidden" name="cPassword" value={password} />

          <div className="flex flex-col gap-2">
            {state.status === "select" &&
              state.profiles.map((profile) => (
                <button
                  key={profile.id}
                  type="submit"
                  name="idActiveProfile"
                  value={profile.id}
                  disabled={pending}
                  className="flex flex-col items-start rounded-lg border border-black/10 px-4 py-3 text-left transition-colors hover:bg-black/[0.03] disabled:opacity-50 dark:border-white/10 dark:hover:bg-white/[0.05]"
                >
                  <span className="font-medium">{profile.officeName}</span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {profile.roleName}
                  </span>
                </button>
              ))}
          </div>

          <button
            type="button"
            onClick={() => setForceCredentials(true)}
            className="text-sm text-zinc-500 underline-offset-4 hover:underline"
          >
            Usar otra cuenta
          </button>
        </>
      ) : (
        <>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Correo
            <input
              name="cEmail"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-black/15 bg-transparent px-3 py-2 text-base outline-none focus:border-black/40 dark:border-white/15 dark:focus:border-white/40"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium">
            Contraseña
            <input
              name="cPassword"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-black/15 bg-transparent px-3 py-2 text-base outline-none focus:border-black/40 dark:border-white/15 dark:focus:border-white/40"
            />
          </label>

          {state.status === "error" && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {state.message}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-zinc-900 px-4 py-2.5 font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {pending ? "Ingresando…" : "Ingresar"}
          </button>
        </>
      )}
    </form>
  );
}

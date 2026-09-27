// Tipos y constantes del formulario de login. Separado de "auth.actions.ts"
// porque un archivo "use server" solo puede exportar funciones async.

/** Authentication choice shown in the login selector. */
export type AuthenticationOption =
  | { kind: "office-profile"; profileId: number; roleName: string; officeName: string }
  | { kind: "system-role"; assignmentId: number; roleName: string };

export type LoginFormState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "select"; options: AuthenticationOption[]; message?: string };

export const initialLoginState: LoginFormState = { status: "idle" };

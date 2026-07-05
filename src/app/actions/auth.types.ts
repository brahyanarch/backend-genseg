// Tipos y constantes del formulario de login. Separado de "auth.actions.ts"
// porque un archivo "use server" solo puede exportar funciones async.

/** Opción de perfil mostrada en el selector (view model serializable). */
export interface ProfileOption {
  id: number;
  roleName: string;
  officeName: string;
}

export type LoginFormState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "select"; profiles: ProfileOption[] };

export const initialLoginState: LoginFormState = { status: "idle" };

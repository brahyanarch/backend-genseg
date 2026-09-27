import type { Authentication } from "../entities/session";
import type { Credentials } from "../entities/credentials";

/**
 * Puerto de autenticación. La infraestructura lo implementa hablando con el
 * backend real. La selección es opcional:
 *
 * - Sin ella: paso 1, devuelve el usuario con sus opciones disponibles.
 * - Con ella: paso 2, devuelve el token ligado al perfil o asignación elegida.
 *
 * Lanza `InvalidCredentialsError` si las credenciales no son válidas.
 */
export interface AuthenticationPort {
  authenticate(
    credentials: Credentials,
    selection?: AuthenticationSelection,
  ): Promise<Authentication>;
  switchProfile(selection: ProfileSwitchSelection): Promise<void>;
}

export type ProfileSwitchSelection =
  | { kind: "office-profile"; id: number }
  | { kind: "system-assignment"; id: number };

export type AuthenticationSelection =
  | { kind: "office-profile"; id: number }
  | { kind: "system-assignment"; id: number };

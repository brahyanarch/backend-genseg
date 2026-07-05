import type { Authentication } from "../entities/session";
import type { Credentials } from "../entities/credentials";

/**
 * Puerto de autenticación. La infraestructura lo implementa hablando con el
 * backend real. `activeProfileId` es opcional:
 *
 * - Sin él: paso 1, devuelve el usuario con sus perfiles (token sin perfil).
 * - Con él: paso 2, devuelve el token ligado al perfil activo.
 *
 * Lanza `InvalidCredentialsError` si las credenciales no son válidas.
 */
export interface AuthenticationPort {
  authenticate(
    credentials: Credentials,
    activeProfileId?: number,
  ): Promise<Authentication>;
}

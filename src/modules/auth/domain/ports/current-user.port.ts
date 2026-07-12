import type { CurrentUser } from "../entities/current-user";

/**
 * Puerto para consultar al usuario logueado a partir de su token.
 * La infraestructura lo implementa hablando con el backend (endpoint `/me`).
 *
 * Lanza `SessionExpiredError` si el backend rechaza el token (401/403).
 */
export interface CurrentUserPort {
  getByToken(token: string): Promise<CurrentUser>;
}

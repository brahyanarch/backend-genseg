import type { SessionStorePort } from "../domain/ports/session-store.port";
import type { CurrentUserPort } from "../domain/ports/current-user.port";
import type { CurrentUser } from "../domain/entities/current-user";
import { SessionExpiredError } from "../domain/errors";

/**
 * Caso de uso: obtener el usuario logueado (con sus permisos).
 *
 * Lee el token de la sesión persistida y lo canjea en el endpoint `/me`.
 * Si no hay sesión, o el backend rechaza el token, devuelve `null` (y limpia
 * la sesión inválida) para que la UI redirija al login.
 */
export class GetCurrentUserUseCase {
  constructor(
    private readonly sessions: SessionStorePort,
    private readonly currentUser: CurrentUserPort,
  ) {}

  async execute(): Promise<CurrentUser | null> {
    const session = await this.sessions.get();
    if (!session) {
      return null;
    }

    try {
      return await this.currentUser.getByToken(session.token);
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        await this.sessions.clear();
        return null;
      }
      throw error;
    }
  }
}

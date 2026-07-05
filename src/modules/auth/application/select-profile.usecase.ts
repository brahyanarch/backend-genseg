import type { AuthenticationPort } from "../domain/ports/authentication.port";
import type { SessionStorePort } from "../domain/ports/session-store.port";
import type { Credentials } from "../domain/entities/credentials";

/**
 * Caso de uso: elegir un perfil activo (paso 2).
 *
 * Reautentica con las credenciales + `activeProfileId` para obtener el token
 * ligado a ese perfil y persiste la sesión.
 */
export class SelectProfileUseCase {
  constructor(
    private readonly auth: AuthenticationPort,
    private readonly sessions: SessionStorePort,
  ) {}

  async execute(
    credentials: Credentials,
    activeProfileId: number,
  ): Promise<void> {
    const { token } = await this.auth.authenticate(credentials, activeProfileId);
    await this.sessions.save(token);
  }
}

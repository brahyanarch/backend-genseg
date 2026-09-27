import type {
  AuthenticationPort,
  AuthenticationSelection,
} from "../domain/ports/authentication.port";
import type { SessionStorePort } from "../domain/ports/session-store.port";
import type { Credentials } from "../domain/entities/credentials";

/**
 * Caso de uso: elegir una alternativa de autenticación (paso 2).
 *
 * Reautentica con las credenciales y la selección elegida para obtener el token.
 */
export class SelectProfileUseCase {
  constructor(
    private readonly auth: AuthenticationPort,
    private readonly sessions: SessionStorePort,
  ) {}

  async execute(
    credentials: Credentials,
    selection: AuthenticationSelection,
  ): Promise<void> {
    const { token } = await this.auth.authenticate(credentials, selection);
    await this.sessions.save(token);
  }
}

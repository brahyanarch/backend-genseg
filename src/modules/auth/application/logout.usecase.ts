import type { SessionStorePort } from "../domain/ports/session-store.port";

/** Caso de uso: cerrar sesión eliminando la sesión persistida. */
export class LogoutUseCase {
  constructor(private readonly sessions: SessionStorePort) {}

  async execute(): Promise<void> {
    await this.sessions.clear();
  }
}

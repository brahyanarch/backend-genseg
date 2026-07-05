import type { SessionStorePort } from "../domain/ports/session-store.port";
import type { Session } from "../domain/entities/session";

/** Caso de uso: obtener la sesión actual (o null si no hay). */
export class GetSessionUseCase {
  constructor(private readonly sessions: SessionStorePort) {}

  execute(): Promise<Session | null> {
    return this.sessions.get();
  }
}

import type { Session } from "../entities/session";

/**
 * Puerto de persistencia de sesión. La infraestructura lo implementa (p. ej.
 * con cookies httpOnly). El dominio no sabe *dónde* ni *cómo* se guarda.
 */
export interface SessionStorePort {
  save(token: string): Promise<void>;
  get(): Promise<Session | null>;
  clear(): Promise<void>;
}

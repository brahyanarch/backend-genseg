/**
 * Sesión persistida tras autenticarse con un perfil activo.
 * El `token` es el JWT emitido por el backend.
 */
export interface Session {
  token: string;
  activeProfileId: number | null;
  activeSystemAssignmentId: number | null;
  expiresAt: Date | null;
}

/** Resultado de una autenticación contra el backend (aún sin persistir). */
export interface Authentication {
  token: string;
  user: import("./user").User;
}

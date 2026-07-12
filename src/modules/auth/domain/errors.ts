/** Error de dominio: credenciales inválidas o rechazadas por el backend. */
export class InvalidCredentialsError extends Error {
  constructor(message = "Correo o contraseña incorrectos") {
    super(message);
    this.name = "InvalidCredentialsError";
  }
}

/** Error de dominio: fallo al comunicarse con el proveedor de autenticación. */
export class AuthenticationUnavailableError extends Error {
  constructor(message = "No se pudo contactar el servicio de autenticación") {
    super(message);
    this.name = "AuthenticationUnavailableError";
  }
}

/**
 * Error de dominio: el token existe pero el backend lo rechaza (401/403).
 * Señala que la sesión debe limpiarse y el usuario volver a autenticarse.
 */
export class SessionExpiredError extends Error {
  constructor(message = "La sesión expiró o no es válida") {
    super(message);
    this.name = "SessionExpiredError";
  }
}

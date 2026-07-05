// Decodificación *sin verificar firma* del JWT del backend.
// No tenemos el secreto del backend; solo leemos el payload para conocer la
// expiración (comprobaciones "optimistas"). La verificación real la hace el
// backend en cada petición autenticada.

export interface JwtPayload {
  nId?: number;
  cEmail?: string;
  idActiveProfile?: number;
  iat?: number;
  /** Expiración en segundos (epoch). */
  exp?: number;
  [key: string]: unknown;
}

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );
  // atob existe tanto en el runtime del proxy como en el navegador.
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    return JSON.parse(base64UrlDecode(payload)) as JwtPayload;
  } catch {
    return null;
  }
}

/** Milisegundos epoch de expiración, o null si el token no la declara. */
export function jwtExpiresAt(token: string): Date | null {
  const exp = decodeJwt(token)?.exp;
  return typeof exp === "number" ? new Date(exp * 1000) : null;
}

/** `true` si el token no tiene `exp` o ya expiró (con margen opcional en s). */
export function isJwtExpired(token: string, skewSeconds = 0): boolean {
  const exp = decodeJwt(token)?.exp;
  if (typeof exp !== "number") return true;
  return exp <= Date.now() / 1000 + skewSeconds;
}

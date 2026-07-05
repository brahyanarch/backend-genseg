import "server-only";

import { cookies } from "next/headers";

import type { SessionStorePort } from "../../domain/ports/session-store.port";
import type { Session } from "../../domain/entities/session";
import { decodeJwt, isJwtExpired, jwtExpiresAt } from "../jwt";
import { SESSION_COOKIE_NAME } from "./session-cookie.constants";

/**
 * Adaptador del puerto de sesión que persiste el token en una cookie httpOnly.
 * El token nunca es accesible por JavaScript del cliente (mitiga XSS).
 */
export class CookieSessionStoreAdapter implements SessionStorePort {
  async save(token: string): Promise<void> {
    const cookieStore = await cookies();
    const expiresAt = jwtExpiresAt(token);

    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      // Si el token declara expiración, alineamos la cookie con ella.
      ...(expiresAt ? { expires: expiresAt } : {}),
    });
  }

  async get(): Promise<Session | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token || isJwtExpired(token)) {
      return null;
    }

    const payload = decodeJwt(token);
    return {
      token,
      activeProfileId: payload?.idActiveProfile ?? null,
      expiresAt: jwtExpiresAt(token),
    };
  }

  async clear(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  }
}

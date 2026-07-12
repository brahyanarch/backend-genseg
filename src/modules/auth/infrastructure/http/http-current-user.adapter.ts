import "server-only";

import type { CurrentUserPort } from "../../domain/ports/current-user.port";
import type { CurrentUser } from "../../domain/entities/current-user";
import {
  AuthenticationUnavailableError,
  SessionExpiredError,
} from "../../domain/errors";
import { type MeResponseDTO, toCurrentUser } from "./dto";

/**
 * Adaptador HTTP del puerto "quién soy": pregunta al backend por el usuario
 * logueado (`GET {baseUrl}/v1/auth/me`) enviando el token en `Authorization`.
 */
export class HttpCurrentUserAdapter implements CurrentUserPort {
  constructor(private readonly baseUrl: string) {}

  async getByToken(token: string): Promise<CurrentUser> {
    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
    } catch {
      throw new AuthenticationUnavailableError();
    }

    // El token ya no vale: la capa de aplicación limpiará la sesión.
    if (res.status === 401 || res.status === 403) {
      throw new SessionExpiredError();
    }

    const body = (await res.json().catch(() => null)) as MeResponseDTO | null;

    if (!res.ok || !body?.nSuccess || !body.data) {
      throw new AuthenticationUnavailableError(
        body?.message ?? "No se pudo obtener el usuario actual",
      );
    }

    return toCurrentUser(body.data);
  }
}

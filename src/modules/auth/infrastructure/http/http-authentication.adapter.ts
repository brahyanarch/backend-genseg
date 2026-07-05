import "server-only";

import type { AuthenticationPort } from "../../domain/ports/authentication.port";
import type { Authentication } from "../../domain/entities/session";
import type { Credentials } from "../../domain/entities/credentials";
import {
  AuthenticationUnavailableError,
  InvalidCredentialsError,
} from "../../domain/errors";
import { type LoginResponseDTO, toLoginRequestDTO, toUser } from "./dto";

/**
 * Adaptador HTTP del puerto de autenticación: habla con el backend real
 * (`POST {baseUrl}/v1/auth/login`) y traduce DTOs <-> dominio.
 */
export class HttpAuthenticationAdapter implements AuthenticationPort {
  constructor(private readonly baseUrl: string) {}

  async authenticate(
    credentials: Credentials,
    activeProfileId?: number,
  ): Promise<Authentication> {
    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toLoginRequestDTO(credentials, activeProfileId)),
        cache: "no-store",
      });
    } catch {
      throw new AuthenticationUnavailableError();
    }

    const body = (await res
      .json()
      .catch(() => null)) as LoginResponseDTO | null;

    if (!res.ok || !body?.nSuccess || !body.data) {
      throw new InvalidCredentialsError(
        body?.message ?? "Correo o contraseña incorrectos",
      );
    }

    return {
      token: body.data.token,
      user: toUser(body.data.user),
    };
  }
}

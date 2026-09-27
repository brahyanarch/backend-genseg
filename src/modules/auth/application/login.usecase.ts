import type { AuthenticationPort } from "../domain/ports/authentication.port";
import type { SessionStorePort } from "../domain/ports/session-store.port";
import type { Credentials } from "../domain/entities/credentials";
import type { User } from "../domain/entities/user";
import { requiresProfileSelection } from "../domain/entities/user";

/**
 * Resultado del caso de uso de login (paso 1).
 * - `authenticated`: sesión ya persistida (había una única alternativa).
 * - `profile-selection-required`: hay que elegir una alternativa.
 */
export type LoginResult =
  | { status: "authenticated" }
  | { status: "profile-selection-required"; user: User };

/**
 * Caso de uso: iniciar sesión con correo y contraseña.
 *
 * Si el usuario tiene una sola alternativa, la selecciona automáticamente.
 * Si hay más de una, devuelve las opciones para que la UI las muestre.
 */
export class LoginUseCase {
  constructor(
    private readonly auth: AuthenticationPort,
    private readonly sessions: SessionStorePort,
  ) {}

  async execute(credentials: Credentials): Promise<LoginResult> {
    const { user, token: initialToken } = await this.auth.authenticate(credentials);

    if (process.env.NODE_ENV === "development") {
      console.info("[auth.login] authentication choices received", {
        profileCount: user.profiles.length,
        systemAssignmentCount: user.systemRoleAssignments.length,
      });
    }

    if (requiresProfileSelection(user)) {
      if (process.env.NODE_ENV === "development") {
        console.info("[auth.login] showing authentication choice selector");
      }
      return { status: "profile-selection-required", user };
    }

    if (user.profiles.length + user.systemRoleAssignments.length === 0) {
      await this.sessions.save(initialToken);
      return { status: "authenticated" };
    }

    const onlyProfile = user.profiles[0];
    const onlyAssignment = user.systemRoleAssignments[0];
    if (process.env.NODE_ENV === "development") {
      console.info(
        "[auth.login] selecting the only available authentication choice",
        { kind: onlyProfile ? "office-profile" : "system-assignment" },
      );
    }
    const { token } = await this.auth.authenticate(
      credentials,
      onlyProfile
        ? { kind: "office-profile", id: onlyProfile.id }
        : { kind: "system-assignment", id: onlyAssignment.assignmentId },
    );
    await this.sessions.save(token);

    return { status: "authenticated" };
  }
}

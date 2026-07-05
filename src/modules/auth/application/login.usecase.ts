import type { AuthenticationPort } from "../domain/ports/authentication.port";
import type { SessionStorePort } from "../domain/ports/session-store.port";
import type { Credentials } from "../domain/entities/credentials";
import type { User } from "../domain/entities/user";
import { requiresProfileSelection } from "../domain/entities/user";

/**
 * Resultado del caso de uso de login (paso 1).
 * - `authenticated`: sesión ya persistida (el usuario tenía un único perfil).
 * - `profile-selection-required`: hay que elegir perfil antes de continuar.
 */
export type LoginResult =
  | { status: "authenticated" }
  | { status: "profile-selection-required"; user: User };

/**
 * Caso de uso: iniciar sesión con correo y contraseña.
 *
 * Si el usuario tiene un solo perfil, lo selecciona automáticamente
 * (segunda llamada al backend) y persiste la sesión. Si tiene varios,
 * devuelve el usuario para que la UI muestre el selector de perfil.
 */
export class LoginUseCase {
  constructor(
    private readonly auth: AuthenticationPort,
    private readonly sessions: SessionStorePort,
  ) {}

  async execute(credentials: Credentials): Promise<LoginResult> {
    const { user } = await this.auth.authenticate(credentials);

    if (requiresProfileSelection(user)) {
      return { status: "profile-selection-required", user };
    }

    // Un único perfil: seleccionarlo automáticamente para obtener el token
    // ligado al perfil activo y persistir la sesión.
    const onlyProfile = user.profiles[0];
    const { token } = await this.auth.authenticate(credentials, onlyProfile.id);
    await this.sessions.save(token);

    return { status: "authenticated" };
  }
}

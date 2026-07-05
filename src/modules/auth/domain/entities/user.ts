import type { Profile } from "./profile";

/** Usuario autenticado y sus perfiles disponibles. */
export interface User {
  email: string;
  name: string;
  profiles: Profile[];
}

/** `true` si el usuario debe elegir perfil (tiene más de uno). */
export function requiresProfileSelection(user: User): boolean {
  return user.profiles.length > 1;
}

import type { Profile } from "./profile";
import type { Permission } from "./permission";

/**
 * Usuario autenticado tal como lo describe el endpoint "quién soy" (`/me`),
 * resuelto a partir del token de la sesión activa. A diferencia de `User`
 * (paso previo al login), aquí ya conocemos los `permissions` del perfil activo.
 */
export interface CurrentUser {
  id: number;
  email: string;
  name: string;
  profiles: Profile[];
  permissions: Permission[];
}

/** `true` si el usuario tiene el permiso indicado (por nombre). */
export function hasPermission(
  user: CurrentUser,
  permissionName: string,
): boolean {
  return user.permissions.some((permission) => permission.name === permissionName);
}

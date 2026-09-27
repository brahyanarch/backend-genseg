/**
 * Perfil del usuario dentro de una oficina con un rol.
 * `id` es el identificador que el backend espera como `idActiveProfile`.
 */
export interface Profile {
  id: number;
  roleId: number;
  roleName: string;
  officeId: number;
  officeName: string;
  expiresAt: Date | null;
  isActive?: boolean;
  isValid?: boolean;
  roleType?: string;
}

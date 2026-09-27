import type { Profile } from "./profile";

export interface SystemRoleAssignment {
  roleId: number;
  roleName: string;
  assignmentId: number;
  isActive?: boolean;
  isValid?: boolean;
  roleType?: string;
}

/** Usuario autenticado y sus perfiles disponibles. */
export interface User {
  email: string;
  name: string;
  profiles: Profile[];
  systemRoleAssignments: SystemRoleAssignment[];
}

/** `true` if the user must choose an office profile or system role. */
export function requiresProfileSelection(user: User): boolean {
  return user.profiles.length + user.systemRoleAssignments.length > 1;
}

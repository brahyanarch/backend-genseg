// DTOs tal como los expone el backend (con sus prefijos c/n/id...) y los
// mappers que traducen esos DTOs al modelo del dominio. Aislar esto aquí evita
// que el resto de la app dependa de la forma exacta de la API.

import type { SystemRoleAssignment, User } from "../../domain/entities/user";
import type { Profile } from "../../domain/entities/profile";
import type { Permission } from "../../domain/entities/permission";
import type { CurrentUser } from "../../domain/entities/current-user";
import type { Credentials } from "../../domain/entities/credentials";
import type { AuthenticationSelection } from "../../domain/ports/authentication.port";

export interface PerfilDTO {
  idRol: number;
  cNombreRol: string;
  idOficina: number;
  cNombreOficina: string;
  idProfile: number;
  dExpiresAt: string | null;
  lActivo?: boolean;
  lVigente?: boolean;
  cTipoRol?: string;
}

export interface AsignacionSistemaDTO {
  idRol: number;
  cNombreRol: string;
  idAsignacionSistema: number;
  lActivo?: boolean;
  lVigente?: boolean;
  cTipoRol?: string;
}

export interface UserDTO {
  email: string;
  nombre: string;
  perfiles: PerfilDTO[];
  asignacionesSistema: AsignacionSistemaDTO[];
}

export interface LoginResponseDTO {
  nSuccess: boolean;
  data?: {
    token: string;
    user: UserDTO;
  };
  message?: string;
  error?: {
    cCode: string;
    cMessage: string;
    cTechnicalDetails: string;
  };
}

export interface LoginRequestDTO {
  cEmail: string;
  cPassword: string;
  idActiveProfile?: number;
  idActiveSystemAssignment?: number;
}

export function toLoginRequestDTO(
  credentials: Credentials,
  selection?: AuthenticationSelection,
): LoginRequestDTO {
  return {
    cEmail: credentials.email,
    cPassword: credentials.password,
    ...(selection?.kind === "office-profile"
      ? { idActiveProfile: selection.id }
      : {}),
    ...(selection?.kind === "system-assignment"
      ? { idActiveSystemAssignment: selection.id }
      : {}),
  };
}

function toProfile(dto: PerfilDTO): Profile {
  return {
    id: dto.idProfile,
    roleId: dto.idRol,
    roleName: dto.cNombreRol,
    officeId: dto.idOficina,
    officeName: dto.cNombreOficina,
    expiresAt: dto.dExpiresAt ? new Date(dto.dExpiresAt) : null,
    ...(dto.lActivo !== undefined ? { isActive: dto.lActivo } : {}),
    ...(dto.lVigente !== undefined ? { isValid: dto.lVigente } : {}),
    ...(dto.cTipoRol !== undefined ? { roleType: dto.cTipoRol } : {}),
  };
}

function toSystemRoleAssignment(
  dto: AsignacionSistemaDTO,
): SystemRoleAssignment {
  return {
    roleId: dto.idRol,
    roleName: dto.cNombreRol,
    assignmentId: dto.idAsignacionSistema,
    ...(dto.lActivo !== undefined ? { isActive: dto.lActivo } : {}),
    ...(dto.lVigente !== undefined ? { isValid: dto.lVigente } : {}),
    ...(dto.cTipoRol !== undefined ? { roleType: dto.cTipoRol } : {}),
  };
}

export function toUser(dto: UserDTO): User {
  return {
    email: dto.email,
    name: dto.nombre,
    profiles: dto.perfiles.map(toProfile),
    systemRoleAssignments: dto.asignacionesSistema.map(toSystemRoleAssignment),
  };
}

// --- Endpoint "quién soy" (/me) ---

export interface PermisoDTO {
  idPermiso: number;
  cNombrePermiso: string;
}

export interface MeDataDTO {
  idUser: number;
  cEmail: string;
  cNombre: string;
  perfiles: PerfilDTO[];
  asignacionesSistema?: AsignacionSistemaDTO[];
  contextoActivo?: {
    tipo: string;
    id: number;
  };
  permisos: PermisoDTO[];
}

export interface MeResponseDTO {
  nSuccess: boolean;
  data?: MeDataDTO;
  message?: string;
}

function toPermission(dto: PermisoDTO): Permission {
  return {
    id: dto.idPermiso,
    name: dto.cNombrePermiso,
  };
}

export function toCurrentUser(data: MeDataDTO): CurrentUser {
  return {
    id: data.idUser,
    email: data.cEmail,
    name: data.cNombre,
    profiles: data.perfiles.map(toProfile),
    ...(data.asignacionesSistema
      ? { systemRoleAssignments: data.asignacionesSistema.map(toSystemRoleAssignment) }
      : {}),
    ...(data.contextoActivo
      ? {
          activeContext: {
            type: data.contextoActivo.tipo,
            id: data.contextoActivo.id,
          },
        }
      : {}),
    permissions: data.permisos.map(toPermission),
  };
}

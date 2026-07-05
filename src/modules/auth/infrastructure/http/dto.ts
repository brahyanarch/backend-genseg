// DTOs tal como los expone el backend (con sus prefijos c/n/id...) y los
// mappers que traducen esos DTOs al modelo del dominio. Aislar esto aquí evita
// que el resto de la app dependa de la forma exacta de la API.

import type { User } from "../../domain/entities/user";
import type { Profile } from "../../domain/entities/profile";
import type { Credentials } from "../../domain/entities/credentials";

export interface PerfilDTO {
  idRol: number;
  cNombreRol: string;
  idOficina: number;
  cNombreOficina: string;
  idProfile: number;
  dExpiresAt: string | null;
}

export interface UserDTO {
  email: string;
  nombre: string;
  perfiles: PerfilDTO[];
}

export interface LoginResponseDTO {
  nSuccess: boolean;
  data?: {
    token: string;
    user: UserDTO;
  };
  message?: string;
}

export interface LoginRequestDTO {
  cEmail: string;
  cPassword: string;
  idActiveProfile?: number;
}

export function toLoginRequestDTO(
  credentials: Credentials,
  activeProfileId?: number,
): LoginRequestDTO {
  return {
    cEmail: credentials.email,
    cPassword: credentials.password,
    ...(activeProfileId !== undefined
      ? { idActiveProfile: activeProfileId }
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
  };
}

export function toUser(dto: UserDTO): User {
  return {
    email: dto.email,
    name: dto.nombre,
    profiles: dto.perfiles.map(toProfile),
  };
}

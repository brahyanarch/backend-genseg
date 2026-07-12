"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import type { CurrentUser } from "@/modules/auth/domain/entities/current-user";
import { hasPermission as userHasPermission } from "@/modules/auth/domain/entities/current-user";
import { logoutAction } from "@/app/actions/auth.actions";

interface AuthContextValue {
  user: CurrentUser;
  activeProfileId: number | null;
  hasPermission: (permissionName: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Acceso al usuario logueado en componentes cliente.
 * Debe usarse dentro de `<AuthProvider>` (lo monta el layout de la intranet).
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return context;
}

/**
 * Provee el usuario al árbol cliente. El usuario se resuelve en el servidor
 * (leyendo la cookie httpOnly y consultando `/me`) y se pasa aquí ya hidratado
 * como `user`. No se hace ningún fetch en el cliente ni se expone el token.
 */
export function AuthProvider({
  user,
  activeProfileId,
  children,
}: {
  user: CurrentUser;
  activeProfileId: number | null;
  children: ReactNode;
}) {
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      activeProfileId,
      hasPermission: (permissionName) => userHasPermission(user, permissionName),
      // El cierre de sesión limpia la cookie httpOnly en el servidor.
      logout: () => {
        void logoutAction();
      },
    }),
    [user, activeProfileId],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

import type { ReactNode } from "react";

import { useAuth } from "@/context/AuthContext";

/**
 * Renderiza `children` solo si el usuario tiene el permiso indicado.
 * Un `requiredPermission` vacío significa "sin restricción" (siempre visible).
 */
export function PermissionGuard({
  requiredPermission,
  children,
}: {
  requiredPermission: string;
  children: ReactNode;
}) {
  const { hasPermission } = useAuth();

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return null;
  }

  return <>{children}</>;
}

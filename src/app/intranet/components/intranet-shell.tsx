"use client";

import { Fragment, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Toaster } from "sonner";

import type { CurrentUser } from "@/modules/auth/domain/entities/current-user";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";

const INTRANET_BASE_PATH = "/intranet";

// Etiquetas legibles para rutas conocidas del breadcrumb.
const PATH_LABELS: Record<string, string> = {
  "/intranet/dashboard": "Dashboard",
  "/intranet/settings": "Configuración",
};

function formatPathName(path: string): string {
  return path
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function useBreadcrumbs() {
  const pathname = usePathname();
  const paths = pathname?.split("/").filter(Boolean) ?? [];
  const startIndex = INTRANET_BASE_PATH.split("/").filter(Boolean).length;

  let accumulatedPath = "";
  return paths.slice(startIndex).map((path, index, arr) => {
    accumulatedPath += `/${path}`;
    const href = `${INTRANET_BASE_PATH}${accumulatedPath}`;
    return {
      href,
      label: PATH_LABELS[href] ?? formatPathName(path),
      isLast: index === arr.length - 1,
    };
  });
}

/**
 * Cascarón cliente de la intranet: monta los providers (tema, auth, sidebar)
 * y el chrome (sidebar + cabecera con breadcrumbs). Recibe el `user` ya
 * resuelto en el servidor para hidratar `AuthProvider` sin fetch en cliente.
 */
export function IntranetShell({
  user,
  children,
}: {
  user: CurrentUser;
  children: ReactNode;
}) {
  const breadcrumbs = useBreadcrumbs();

  return (
    <ThemeProvider>
      <AuthProvider user={user}>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-md transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    {breadcrumbs.map((crumb, index) => (
                      <Fragment key={crumb.href}>
                        <BreadcrumbItem
                          className={index === 0 ? "hidden md:block" : ""}
                        >
                          {crumb.isLast ? (
                            <BreadcrumbPage className="font-semibold text-foreground">
                              {crumb.label}
                            </BreadcrumbPage>
                          ) : (
                            <Link
                              href={crumb.href}
                              className="text-muted-foreground transition-colors hover:text-foreground"
                            >
                              {crumb.label}
                            </Link>
                          )}
                        </BreadcrumbItem>
                        {!crumb.isLast && (
                          <BreadcrumbSeparator className="hidden md:block" />
                        )}
                      </Fragment>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>

            <main className="mx-auto w-full max-w-7xl p-6 md:p-8">
              {children}
            </main>

            <Toaster
              position="bottom-right"
              expand={false}
              richColors
              closeButton
            />
          </SidebarInset>
        </SidebarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

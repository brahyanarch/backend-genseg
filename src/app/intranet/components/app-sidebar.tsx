"use client";

import type * as React from "react";
import {
  BookOpen,
  Bot,
  Frame,
  PieChart,
  Settings,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// Datos de navegación. Los `requiredPermission` los evalúa <PermissionGuard>
// contra los permisos del usuario logueado (ver AuthContext).
const data = {
  projects: [
    {
      name: "Inicio",
      url: "/intranet/inicio",
      icon: Frame,
    },
    {
      name: "Notificaciones",
      url: "/intranet/inicio/notificaciones",
      icon: PieChart,
    },
  ],
  navMain: [
    {
      title: "Sub configuración",
      url: "#",
      icon: Settings2,
      requiredPermission: "SUBCONFIGURACION",
      items: [
        {
          title: "Formulario",
          url: "/intranet/inicio/sub-configuracion/formulario",
          requiredPermission: "VER_FORMULARIOS",
        },
        {
          title: "Plantilla Documento",
          url: "/intranet/inicio/sub-configuracion/plantilla-documento",
          requiredPermission: "VER_PLANTILLA_DOCUMENTO",
        },
        {
          title: "Listar Usuarios",
          url: "/intranet/configuracion/usuarios",
          requiredPermission: "VER_USUARIOS",
        },
      ],
    },
    {
      title: "Página principal",
      url: "#",
      icon: Bot,
      requiredPermission: "CONFIG_PAGINA_PRINCIPAL",
      items: [
        {
          title: "Carrusel",
          url: "#",
          requiredPermission: "CONFIG_CARRUSEL",
        },
        {
          title: "Avisos",
          url: "#",
          requiredPermission: "CONFIG_AVISOS",
        },
      ],
    },
    {
      title: "Certificados",
      url: "#",
      icon: BookOpen,
      requiredPermission: "CERTIFICADOS",
      items: [
        {
          title: "Alumnos",
          url: "#",
          requiredPermission: "VER_ALUMNOS",
        },
        {
          title: "Terceros",
          url: "#",
          requiredPermission: "VER_TERCEROS",
        },
        {
          title: "Plantillas",
          url: "#",
          requiredPermission: "VER_PLANTILLAS_CERTIFICADOS",
        },
      ],
    },
    {
      title: "Planificación",
      url: "#",
      icon: SquareTerminal,
      requiredPermission: "PLANIFICACION",
      items: [
        {
          title: "Mis proyectos",
          url: "/intranet/inicio/planificacion/mis-proyectos",
          requiredPermission: "VER_MIS_PROYECTOS",
        },
        {
          title: "Proyectos",
          url: "/intranet/inicio/planificacion/proyectos",
          requiredPermission: "VER_PROYECTOS",
        },
      ],
    },
  ],
  adminNav: [
    {
      title: "Administración del sistema",
      url: "#",
      icon: Settings,
      requiredPermission: "ACCESO_TOTAL_SISTEMA",
      items: [
        {
          title: "Usuarios",
          url: "/intranet/admin/usuarios",
          requiredPermission: "ACCESO_TOTAL_SISTEMA",
        },
        {
          title: "Roles",
          url: "/intranet/admin/roles",
          requiredPermission: "ACCESO_TOTAL_SISTEMA",
        },
        {
          title: "Permisos",
          url: "/intranet/admin/permisos",
          requiredPermission: "ACCESO_TOTAL_SISTEMA",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.projects} />
        <NavMain items={data.navMain} />
        <NavMain items={data.adminNav} label="ADMINISTRACION DE SISTEMA" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

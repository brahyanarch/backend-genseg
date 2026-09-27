"use client";

import { ChevronsUpDown, GalleryVerticalEnd } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { switchProfileAction } from "@/app/actions/auth.actions";
import type { Profile } from "@/modules/auth/domain/entities/profile";

export function TeamSwitcher() {
  const { isMobile } = useSidebar();
  const { user, activeProfileId, activeSystemAssignmentId } = useAuth();

  const activeProfile = activeProfileId === null
    ? undefined
    : user.profiles.find((p: Profile) => p.id === activeProfileId);
  const activeSystemRole = user.systemRoleAssignments?.find(
    (assignment) => assignment.assignmentId === activeSystemAssignmentId,
  ) ?? (user.profiles.length === 0 ? user.systemRoleAssignments?.[0] : undefined);
  const activeRole = activeProfile ?? activeSystemRole;

  if (!activeRole && user.profiles.length === 0 && !user.systemRoleAssignments?.length) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              />
            }
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                {activeRole?.roleName ?? "Administrador"}
              </span>
              <span className="truncate text-xs">
                {activeProfile ? `Oficina: ${activeProfile.officeName}` : "Rol del sistema"}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Perfiles de oficina
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            {user.profiles.map((profile: Profile) => (
              <DropdownMenuItem
                key={`profile-${profile.id}`}
                className="gap-2 p-2"
                disabled={profile.id === activeProfileId}
                onClick={async () => {
                  await switchProfileAction({ kind: "office-profile", id: profile.id });
                }}
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="grid leading-tight">
                  <span className="truncate font-medium">
                    {profile.roleName}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {profile.officeName}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
            {!!user.systemRoleAssignments?.length && (
              <>
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Roles del sistema
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                {user.systemRoleAssignments.map((assignment) => (
                  <DropdownMenuItem
                    key={`system-${assignment.assignmentId}`}
                    className="gap-2 p-2"
                    disabled={assignment.assignmentId === activeSystemAssignmentId}
                    onClick={async () => {
                      await switchProfileAction({
                        kind: "system-assignment",
                        id: assignment.assignmentId,
                      });
                    }}
                  >
                    <div className="flex size-6 items-center justify-center rounded-sm border">
                      <GalleryVerticalEnd className="size-4" />
                    </div>
                    <div className="grid leading-tight">
                      <span className="truncate font-medium">{assignment.roleName}</span>
                  <span className="truncate text-xs text-muted-foreground">Rol del sistema</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

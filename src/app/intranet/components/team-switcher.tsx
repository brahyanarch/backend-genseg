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
  const { user, activeProfileId } = useAuth();

  const activeProfile =
    user.profiles.find((p: Profile) => p.id === activeProfileId) ?? user.profiles[0];

  if (!activeProfile) {
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
                {activeProfile.roleName}
              </span>
              <span className="truncate text-xs">
                {activeProfile.officeName}
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
                Perfiles
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            {user.profiles.map((profile: Profile) => (
              <DropdownMenuItem
                key={profile.id}
                className="gap-2 p-2"
                disabled={profile.id === activeProfile.id}
                onClick={async () => {
                  await switchProfileAction(profile.id);
                  window.location.reload();
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
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

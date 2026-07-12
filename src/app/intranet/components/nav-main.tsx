"use client";

import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";

import { PermissionGuard } from "@/components/PermissionGuard";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  requiredPermission?: string;
  items?: {
    title: string;
    url: string;
    requiredPermission?: string;
  }[];
};

export function NavMain({ items }: { items: NavItem[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Configuración</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <PermissionGuard
            key={item.title}
            requiredPermission={item.requiredPermission ?? ""}
          >
            <SidebarMenuItem>
              <Collapsible defaultOpen={item.isActive}>
                <CollapsibleTrigger
                  render={
                    <SidebarMenuButton
                      tooltip={item.title}
                      className="group/collapsible"
                    />
                  }
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[panel-open]/collapsible:rotate-90" />
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <PermissionGuard
                        key={subItem.title}
                        requiredPermission={subItem.requiredPermission ?? ""}
                      >
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            render={<Link href={subItem.url} />}
                          >
                            <span>{subItem.title}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </PermissionGuard>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>
          </PermissionGuard>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

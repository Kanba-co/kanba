"use client"

import { type LucideIcon } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavSecondary({
  items,
  className,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
  }[]
  className?: string
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <SidebarGroup className={className}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                tooltip={item.title}
                onClick={() => router.push(item.url)}
                className={pathname === item.url ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

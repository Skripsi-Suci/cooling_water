"use client"

import * as React from "react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { IconDashboard, IconListDetails, IconChartBar, IconFolder, IconUsers, IconCamera, IconFileDescription, IconFileAi, IconSettings, IconHelp, IconSearch, IconDatabase, IconReport, IconFileWord, IconInnerShadowTop } from "@tabler/icons-react"
import { Zap } from "lucide-react"

const data = {
  user: {
    name: "Operator",
    email: "operator@pln.co.id",
    avatar: "/avatars/operator.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <IconDashboard />,
    },
    {
      title: "Input Data",
      url: "/dashboard/input",
      icon: <IconListDetails />,
    },
    {
      title: "Riwayat & Laporan",
      url: "/dashboard/reports",
      icon: <IconReport />,
    },
    {
      title: "Performa Model",
      url: "/dashboard/performance",
      icon: <IconChartBar />,
    },
    {
      title: "Kelola User",
      url: "/dashboard/users",
      icon: <IconUsers />,
    },
  ],
  navSecondary: [
    {
      title: "Pengaturan",
      url: "/dashboard/settings",
      icon: <IconSettings />,
    },
    {
      title: "Bantuan",
      url: "/dashboard/help",
      icon: <IconHelp />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  <Zap className="size-5 fill-current" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-foreground">
                    Cooling Water
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    PLN NP UP Arun
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}

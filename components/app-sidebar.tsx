"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
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
import { IconDashboard, IconListDetails, IconChartBar, IconUsers, IconReport } from "@tabler/icons-react"
import { Zap } from "lucide-react"
import Link from "next/link"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <IconDashboard />,
    },
    {
      title: "Input Klasifikasi",
      url: "/dashboard/input",
      icon: <IconListDetails />,
    },
    {
      title: "Riwayat Analisis",
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
              <Link href="/dashboard">
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
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ name: "User", email: "user@pln.co.id", avatar: "" }} />
      </SidebarFooter>
    </Sidebar>
  )
}

"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { createClient } from "@/lib/supabase/client"
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
      title: "Kelola User",
      url: "/dashboard/users",
      icon: <IconUsers />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [mounted, setMounted] = React.useState(false);
  const [userProfile, setUserProfile] = React.useState<{
    full_name: string;
    email: string;
    role: string;
  } | null>(null);
  
  const supabase = createClient();

  React.useEffect(() => {
    setMounted(true);
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', user.id)
          .single();
        
        setUserProfile({
          full_name: profile?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          role: profile?.role || 'operator'
        });
      }
    }
    getUser();
  }, []);

  // Filter items based on role
  const filteredNavItems = data.navMain.filter(item => {
    if (item.title === "Kelola User" && userProfile?.role !== 'admin') {
      return false;
    }
    return true;
  });

  if (!mounted) {
    return (
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarHeader className="h-(--header-height) border-b" />
        <SidebarContent />
        <SidebarFooter className="h-14" />
      </Sidebar>
    );
  }

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
        <NavMain items={filteredNavItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ 
          name: userProfile?.full_name || "Loading...", 
          email: userProfile?.email || "...", 
          avatar: "" 
        }} />
      </SidebarFooter>
    </Sidebar>
  )
}

"use client"

import * as React from "react"
import {
  BookOpen,
  LifeBuoy,
  Send,
  LayoutDashboard,
  Settings,
  Users,
  ClipboardCheck,
  TrendingUp,
  DatabaseBackup,
  UserPlus,
  Compass,
  BadgeCheck,
  FileText,
  FileCheck2,
} from "lucide-react"

import { NavMain, NavItem } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

const data = {
  navSecondary: [
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
    },
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { setOpenMobile, isMobile } = useSidebar()
  const pathname = usePathname()

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
      isActive: pathname === "/",
    },
    {
      title: "Employees",
      url: "/employees",
      icon: Users,
      isActive: pathname.startsWith("/employees"),
    },
    {
      title: "Onboarding",
      url: "/onboarding",
      icon: UserPlus,
      isActive: pathname.startsWith("/onboarding") || pathname.startsWith("/manage/onboarding"),
      items: [
        {
          title: "Hub",
          url: "/onboarding",
          icon: Compass,
          isActive: pathname === "/onboarding" || pathname === "/onboarding/hub",
        },
        {
          title: "Candidate",
          url: "/onboarding/candidate",
          icon: UserPlus,
          isActive:
            pathname.startsWith("/onboarding/candidate") ||
            pathname.startsWith("/manage/onboarding") ||
            pathname.startsWith("/onboarding/review"),
        },
        {
          title: "Employee",
          url: "/onboarding/employee",
          icon: BadgeCheck,
          isActive: pathname.startsWith("/onboarding/employee"),
        },
      ],
    },
    {
      title: "Appraisals",
      url: "/appraisals",
      icon: TrendingUp,
      isActive: pathname === "/appraisals",
    },
    {
      title: "Appraisal Report",
      url: "/appraisals/report",
      icon: ClipboardCheck,
      isActive: pathname.startsWith("/appraisals/report"),
    },
    {
      title: "Manage",
      url: "/manage/letter-templates",
      icon: Settings,
      isActive: pathname.startsWith("/manage") || pathname.startsWith("/data-management"),
      items: [
        {
          title: "Letter Templates",
          url: "/manage/letter-templates",
          icon: FileText,
          isActive: pathname.startsWith("/manage/letter-templates"),
        },
        {
          title: "Letters",
          url: "/manage/letters",
          icon: FileCheck2,
          isActive: pathname.startsWith("/manage/letters"),
        },
        {
          title: "Users",
          url: "/manage/users",
          icon: Users,
          isActive: pathname === "/manage/users",
        },
        {
          title: "Data Management",
          url: "/data-management",
          icon: DatabaseBackup,
          isActive: pathname.startsWith("/data-management"),
        },
      ],
    },
  ]

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link
                href="/"
                onClick={() => {
                  if (isMobile) setOpenMobile(false)
                }}
              >
                <Image
                  src="/ng-icon.png"
                  alt="NavGurukul Logo"
                  width={32}
                  height={32}
                  className="size-8 rounded-lg object-contain"
                />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold tracking-tight">Navgurukul ELC</span>
                  <span className="truncate text-xs text-muted-foreground font-medium">
                    NG ELC Platform
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  )
}
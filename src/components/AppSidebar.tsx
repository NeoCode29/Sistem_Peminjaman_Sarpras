import React from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { 
  Home, 
  Database, 
  CalendarRange, 
  FileText, 
  Settings,
  LogOut 
} from "lucide-react"
import Image from 'next/image'
import Link from 'next/link'

interface AppSidebarProps {
  role?: 'admin' | 'peminjam'
}

export function AppSidebar({ role = 'peminjam' }: AppSidebarProps) {
  const menuItems = [
    {
      title: "Beranda",
      icon: Home,
      href: role === 'admin' ? '/admin' : '/',
    },
    {
      title: "Master Data",
      icon: Database,
      href: role === 'admin' ? '/admin/master-data' : '/master-data',
    },
    {
      title: "Peminjaman",
      icon: CalendarRange,
      href: role === 'admin' ? '/admin/peminjaman' : '/peminjaman',
    },
    {
      title: "Laporan",
      icon: FileText,
      href: role === 'admin' ? '/admin/laporan' : '/laporan',
    },
    {
      title: "Pengaturan",
      icon: Settings,
      href: role === 'admin' ? '/admin/pengaturan' : '/pengaturan',
    },
  ]

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b px-6 py-3">
        <div className="flex flex-col items-center gap-2">
          <Image 
            src="/logo.png" 
            alt="Logo" 
            width={60} 
            height={60}
            className="rounded-full"
          />
          <h1 className="font-semibold text-center">
            SARPRAS
            <br />
            POLIWANGI
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link href={item.href} className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          {/* Logout button at the bottom */}
          <SidebarMenuItem className="mt-auto">
            <SidebarMenuButton asChild>
              <Link href="/logout" className="flex items-center gap-3 text-red-600">
                <LogOut className="h-4 w-4" />
                <span>Keluar</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
} 
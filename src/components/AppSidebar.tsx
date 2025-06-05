import React from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LogOut } from "lucide-react"
import Image from 'next/image'
import Link from 'next/link'
import { menuConfig } from '@/config/menu'
import { UserRole } from '@prisma/client'

interface AppSidebarProps {
  role?: UserRole
}

export function AppSidebar({ role = 'PEMINJAM' }: AppSidebarProps) {
  // Get menu items based on role
  const menuItems = role === 'ADMIN' ? menuConfig.admin : menuConfig.peminjam;

  return (
    <Sidebar className="border-r bg-white">
      <SidebarHeader className="border-b px-6 py-3">
        <div className="flex flex-col items-center gap-2">
          <Image 
            src="/logo-poliwangi.png" 
            alt="Logo" 
            width={60} 
            height={60}
          />
          <h1 className="font-semibold text-center">
            SARPRAS
            <br />
            POLIWANGI
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className='p-2 gap-2'>
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
              <Link href="/auth/signout" className="flex items-center gap-3 text-red-600">
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
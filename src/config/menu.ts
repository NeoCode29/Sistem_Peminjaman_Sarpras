import { LucideIcon, Home, Database, CalendarRange, FileText, Settings, Users, Building, BookOpen, History } from "lucide-react"

export interface MenuItem {
  title: string;
  icon: LucideIcon;
  href: string;
}

type MenuConfig = {
  admin: MenuItem[];
  peminjam: MenuItem[];
}

export const menuConfig: MenuConfig = {
  admin: [
    {
      title: "Dashboard",
      icon: Home,
      href: "/admin",
    },
    {
      title: "Data Pengguna",
      icon: Users,
      href: "/admin/manajemen-pengguna",
    },
    {
      title: "Data Sarpras",
      icon: Building,
      href: "/admin/manajemen-sarpras",
    },
    {
      title: "Daftar Peminjaman",
      icon: BookOpen,
      href: "/admin/peminjaman",
    },
    {
      title: "Laporan",
      icon: FileText,
      href: "/admin/laporan",
    },
    {
      title: "Log Aplikasi",
      icon: History,
      href: "/admin/log-aplikasi",
    },
    {
      title: "Pengaturan",
      icon: Settings,
      href: "/admin/settings",
    },
  ],
  peminjam: [
    {
      title: "Beranda",
      icon: Home,
      href: "/peminjam",
    },
    {
      title: "Daftar Sarpras",
      icon: Building,
      href: "/peminjam/daftar-sarpras",
    },
    {
      title: "Daftar Peminjaman",
      icon: BookOpen,
      href: "/peminjam/peminjaman",
    },
    {
      title: "Pengaturan",
      icon: Settings,
      href: "/peminjam/settings",
    },
  ]
}; 
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
      title: "Riwayat Peminjaman",
      icon: History,
      href: "/admin/history",
    },
    {
      title: "Laporan",
      icon: FileText,
      href: "/admin/laporan",
    },
    {
      title: "Pengaturan",
      icon: Settings,
      href: "/admin/pengaturan",
    },
  ],
  peminjam: [
    {
      title: "Beranda",
      icon: Home,
      href: "/peminjam",
    },
    {
      title: "Daftar Sarana",
      icon: Building,
      href: "/peminjam/sarana",
    },
    {
      title: "Ajukan Peminjaman",
      icon: BookOpen,
      href: "/peminjam/peminjaman/create",
    },
    {
      title: "Riwayat Peminjaman",
      icon: History,
      href: "/peminjam/peminjaman/history",
    },
    {
      title: "Profil",
      icon: Settings,
      href: "/peminjam/profile",
    },
  ]
}; 
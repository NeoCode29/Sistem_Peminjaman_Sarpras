"use client";
import { Bell, Info, UserCircle2, ShieldCheck, GraduationCap } from "lucide-react";
import Image from "next/image";
import { SidebarTrigger } from "./ui/sidebar";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { usePathname } from "next/navigation";

interface User {
  name?: string | null;
  role: "ADMIN" | "PEMINJAM";
  image?: string | null;
}

interface AppHeaderProps {
  user: User;
}

export default function AppHeader({ user }: AppHeaderProps) {
  const pathname = usePathname();
  const currentDate = new Date();

  // Function to get page title from pathname
  const getPageTitle = (path: string) => {
    // Remove leading slash and split by remaining slashes
    const segments = path.slice(1).split('/');
    
    // If path is empty or just "/", return "Beranda"
    if (!segments[0]) return "Beranda";
    
    // Capitalize first letter and replace hyphens with spaces
    return segments[segments.length - 1]
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Function to limit name to 2 words
  const limitName = (name: string) => {
    return name.split(' ').slice(0, 2).join(' ');
  };

  // Get role icon based on user role
  const RoleIcon = user.role === "ADMIN" ? ShieldCheck : GraduationCap;

  return (
    <header className="w-full h-16 px-3 md:px-6 border-b border-gray-300 flex items-center justify-between bg-white">
      <div className="flex items-center gap-2 md:gap-4">
        <SidebarTrigger className="md:hidden"/>
        {/* Left: Judul & Tanggal */}
        <div>
          <h1 className="text-base md:text-lg font-semibold truncate max-w-[150px] md:max-w-none">
            {getPageTitle(pathname)}
          </h1>
          <p className="text-[10px] md:text-xs text-gray-500 hidden sm:block">
            {format(currentDate, "EEEE, dd MMMM yyyy", { locale: id })}
          </p>
          <p className="text-[10px] md:text-xs text-gray-500 sm:hidden">
            {format(currentDate, "dd/MM/yyyy", { locale: id })}
          </p>
        </div>
      </div>

      {/* Right: Icon & Profil */}
      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden sm:flex items-center gap-4">
          <Bell size={20} className="cursor-pointer" />
          <Info size={20} className="cursor-pointer" />
          <div className="border-l h-6 border-gray-300" />
        </div>
        <div className="flex items-center gap-2">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || 'User'}
              width={32}
              height={32}
              className="w-7 h-7 md:w-8 md:h-8 rounded-full"
            />
          ) : (
            <UserCircle2 className="w-7 h-7 md:w-8 md:h-8 text-gray-400" />
          )}
          <div className="text-sm hidden sm:block">
            <div className="font-semibold leading-tight">{limitName(user.name || 'User')}</div>
            <div className="text-gray-500 text-xs -mt-1 flex items-center gap-1">
              <RoleIcon size={12} />
              {user.role.toLowerCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

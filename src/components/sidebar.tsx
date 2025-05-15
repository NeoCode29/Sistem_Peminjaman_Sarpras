'use client';

import Image from 'next/image';
import { useState, ReactNode } from 'react';
import {
  LayoutGrid,
  History,
  Settings,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="relative h-screen float-left">
      {/* Slide toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-4 right-[-16px] z-20 bg-blue-600 border border-gray-300 rounded-full p-1 shadow"
      >
        {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>

      {/* Sidebar Panel */}
      <aside
        className={`h-full bg-white border-r border-gray-300 shadow-md transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} absolute z-10`}
      >
        {/* Logo & Title */}
        <div>
          <div className="p-6 border-b border-gray-300 text-center">
            <div className="flex justify-center mb-2">
              <Image src="/logo-poliwangi.png" alt="Logo" width={50} height={50} />
            </div>
            <h1 className="text-sm font-bold leading-tight text-black">
              SARPRAS <br /> POLIWANGI
            </h1>
          </div>

          {/* Menu */}
          <nav className="mt-4 px-6 space-y-4 text-sm font-medium text-gray-700">
            <MenuItem icon={<LayoutGrid size={18} />} text="Beranda" />
            <MenuItem icon={<History size={18} />} text="Riwayat Peminjaman" />
            <MenuItem icon={<Settings size={18} />} text="Pengaturan" />
            <MenuItem icon={<FileText size={18} />} text="Pengajuan" />
          </nav>
        </div>

        {/* Logout */}
        <div className="px-6 py-4 text-gray-700">
          <MenuItem icon={<LogOut size={18} />} text="Keluar" />
        </div>
      </aside>
    </div>
  );
}

type MenuItemProps = {
  icon: ReactNode;
  text: string;
};

const MenuItem = ({ icon, text }: MenuItemProps) => {
  return (
    <div className="flex items-center space-x-3 cursor-pointer hover:text-blue-600">
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  );
};

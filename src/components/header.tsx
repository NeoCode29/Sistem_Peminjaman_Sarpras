import { Bell, Info } from "lucide-react";
import Image from "next/image";

export default function Header() {
  return (
    <header className="hover:bg-gray-100 w-full h-16 px-6 border-b border-gray-300 flex items-center justify-between  bg-white">
      {/* Left: Judul & Tanggal */}
      <div>
        <h1 className="text-lg font-semibold">Beranda</h1>
        <p className="text-xs text-gray-500">Senin, 20 Mei 2025</p>
      </div>

      {/* Right: Icon & Profil */}
      <div className="flex items-center gap-4">
        <Bell size={20} className="cursor-pointer" />
        <Info size={20} className="cursor-pointer" />
        <div className="border-l h-6 border-gray-300" />
        <div className="flex items-center gap-2">
          <Image
            src="/image.png"
            alt="User"
            width={32}
            height={32}
            className="rounded-full"
          />
          <div className="text-sm">
            <div className="font-semibold leading-tight">Budi Santoso</div>
            <div className="text-gray-500 text-xs -mt-1">mahasiswa</div>
          </div>
        </div>
      </div>
    </header>
  );
}

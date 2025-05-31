'use client';

import { Box, Archive, Mail } from 'lucide-react';

const stats = [
  {
    title: 'Total Asset',
    value: 1500,
    icon: <Box className="w-6 h-6 text-black" />,
    bg: 'bg-blue-100',
  },
  {
    title: 'Peminjaman Aktif',
    value: 20,
    icon: <Archive className="w-6 h-6 text-black" />,
    bg: 'bg-green-200',
  },
  {
    title: 'Pengajuan Baru',
    value: 2,
    icon: <Mail className="w-6 h-6 text-black" />,
    bg: 'bg-yellow-200',
  },
];

export default function Statistic() {
  return (
    <div className="flex gap-4 w-fit">
      {stats.map((item, index) => (
        <div
          key={index}
          className="flex items-center bg-white p-4 rounded-xl shadow w-[200px] h-[80px]"
        >
          <div className={`p-3 rounded-md ${item.bg} mr-4`}>
            {item.icon}
          </div>
          <div>
            <p className="text-sm text-gray-600">{item.title}</p>
            <p className="text-xl font-bold text-black">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

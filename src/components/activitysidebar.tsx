'use client';

import { Clock } from 'lucide-react';

const activities = [
  {
    label: 'Pengajuan Peminjaman',
    color: 'blue',
    description: 'Budi mengajukan peminjaman sarana & sarpras',
    date: '09 Mei 2025 - 10:12',
  },
  {
    label: 'Validasi Pengajuan',
    color: 'green',
    description: 'Menyetujui pengajuan budi untuk acara "seminar"',
    date: '09 Mei 2025 - 10:12',
  },
  {
    label: 'Validasi Pengajuan',
    color: 'red',
    description: 'Menolak pengajuan budi untuk acara "seminar pembelajaran"',
    date: '09 Mei 2025 - 10:12',
  },
  {
    label: 'Pengembalian Barang',
    color: 'yellow',
    description: 'Budi mengembalikan sarana & sarpras',
    date: '09 Mei 2025 - 10:12',
  },
];

const colorMap: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-800 border-blue-400',
  green: 'bg-green-100 text-green-800 border-green-400',
  red: 'bg-red-100 text-red-800 border-red-400',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-400',
};

export default function ActivitySidebar() {
  return (
    <div className="w-[359px] h-[847px] bg-white border-black rounded-xl shadow p-4 overflow-y-auto ">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">History Aktivitas</h2>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="border border-gray-300 rounded-lg p-3 flex flex-col space-y-2"
          >
            <span
              className={`text-xs px-2 py-1 border rounded-lg font-semibold w-max ${colorMap[activity.color]}`}
            >
              {activity.label}
            </span>
            <p className="text-sm text-black">{activity.description}</p>
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              {activity.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

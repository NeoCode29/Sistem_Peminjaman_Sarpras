import { MoreVertical, MapPin } from 'lucide-react';

export default function EventCard() {
  return (
    <div className="flex flex-col h-[100px] w-[300px] bg-white rounded-xl shadow p-4 border border-gray-200">
      {/* Top: Time & menu */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-red-600 rounded-full"></span>
          <span>11.00 - 12.00 | Senin, 6, 2025</span>
        </div>
        <MoreVertical className="w-4 h-4 cursor-pointer" />
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-black mb-2">
        Pembangunan IKN lorem ipsum
      </h3>

      {/* Location */}
      <div className="flex items-center text-sm text-gray-500 gap-2">
        <MapPin className="w-4 h-4" />
        <span>Aula Azwar Annas</span>
      </div>
    </div>
  );
}

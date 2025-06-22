'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { MapPin, Calendar, Users, Building } from 'lucide-react';

interface MarkingData {
  id: string;
  nama_acara: string;
  tanggal_acara_dimulai: Date;
  tanggal_acara_berakhir: Date | null;
  waktu_mulai: string | null;
  waktu_berakhir: string | null;
  deskripsi: string | null;
  lokasi: string | null;
  lokasi_manual: string | null;
  jumlah_peserta: number | null;
  status: string;
  user: {
    name: string | null;
    email: string | null;
  };
  ormawa: {
    nama: string;
  } | null;
  unit_pegawai: string | null;

  createdAt: Date;
}

interface MarkingInfoProps {
  selectedDate?: Date;
  userId: string;
}

export function MarkingInfo({ selectedDate, userId }: MarkingInfoProps) {
  const [markings, setMarkings] = useState<MarkingData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedDate) {
      setMarkings([]);
      return;
    }

    fetchMarkings();
  }, [selectedDate, userId]);

  const fetchMarkings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/marking?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        // Filter markings for selected date
        const filteredMarkings = data.filter((marking: any) => {
          const markingDate = new Date(marking.tanggal_acara_dimulai);
          return selectedDate && 
                 markingDate.toDateString() === selectedDate.toDateString();
        });
        setMarkings(filteredMarkings);
      }
    } catch (error) {
      console.error('Error fetching markings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AKTIF':
        return <Badge className="bg-green-500 hover:bg-green-600">Aktif</Badge>;
      case 'SELESAI':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Selesai</Badge>;
      case 'DIBATALKAN':
        return <Badge variant="destructive">Dibatalkan</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!selectedDate) {
    return null;
  }

  return (
    <Card className="w-full mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="w-5 h-5 text-orange-500" />
          Marking Acara - {format(selectedDate, "dd MMMM yyyy", { locale: id })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-4 h-4 border border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              Memuat marking...
            </div>
          </div>
        ) : markings.length === 0 ? (
          <div className="text-center py-4">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400 opacity-50" />
            <p className="text-sm text-gray-500">Tidak ada marking pada tanggal ini</p>
          </div>
        ) : (
          <div className="space-y-4">
            {markings.map((marking) => (
              <div key={marking.id} className="p-6 border border-orange-200 rounded-xl bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 shadow-sm hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-bold text-lg text-gray-900">{marking.nama_acara}</h4>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        👤 <span>oleh {marking.user.name}</span>
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusBadge(marking.status)}
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-orange-600" />
                        <div>
                          <span className="font-medium text-gray-900">
                            {format(new Date(marking.tanggal_acara_dimulai), "dd MMMM yyyy", { locale: id })}
                          </span>
                          {marking.tanggal_acara_berakhir && (
                            <span className="text-gray-600"> - {format(new Date(marking.tanggal_acara_berakhir), "dd MMMM yyyy", { locale: id })}</span>
                          )}
                          {marking.waktu_mulai && (
                            <div className="text-orange-600 text-xs mt-1">
                              🕐 {marking.waktu_mulai}
                              {marking.waktu_berakhir && ` - ${marking.waktu_berakhir}`}
                            </div>
                          )}
                        </div>
                      </div>

                      {marking.lokasi && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-orange-600" />
                          <span className="text-gray-700">{marking.lokasi}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {marking.jumlah_peserta && (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-orange-600" />
                          <span className="text-gray-700">{marking.jumlah_peserta} peserta</span>
                        </div>
                      )}

                      {marking.ormawa && (
                        <div className="flex items-center gap-2 text-sm">
                          <Building className="w-4 h-4 text-orange-600" />
                          <span className="text-gray-700">Ormawa: {marking.ormawa.nama}</span>
                        </div>
                      )}

                      {marking.unit_pegawai && (
                        <div className="flex items-center gap-2 text-sm">
                          <Building className="w-4 h-4 text-orange-600" />
                          <span className="text-gray-700">Unit: {marking.unit_pegawai}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {marking.deskripsi && (
                    <div className="bg-white/70 p-4 rounded-lg border-l-4 border-orange-400">
                      <p className="text-sm text-gray-800 leading-relaxed">
                        💭 {marking.deskripsi}
                      </p>
                    </div>
                  )}


                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
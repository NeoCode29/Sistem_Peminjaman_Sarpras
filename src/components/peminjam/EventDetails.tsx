"use client";

import { useState, useEffect } from "react";
import { format, isSameDay } from "date-fns";
import { id } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock, Users, MapPin, Package, Eye } from "lucide-react";
import { getCalendarEventsAction } from "@/actions/peminjamanActions";
import { cn } from "@/lib/utils";
import { EventDetailDialog } from "./EventDetailDialog";

interface CalendarEvent {
  id: string;
  nama_acara: string;
  deskripsi_acara?: string | null;
  tanggal_acara_dimulai: Date | null;
  tanggal_acara_berakhir: Date | null;
  jumlah_peserta?: number;
  status_peminjaman: string;
  status_pengajuan: string;
  type?: 'peminjaman' | 'marking';
  // Marking-specific fields
  lokasi?: string | null;
  lokasi_manual?: string | null;
  waktu_mulai?: string | null;
  waktu_berakhir?: string | null;
  unit_pegawai?: string | null;
  // Common fields
  user?: {
    name?: string | null;
    email?: string | null;
    number_phone?: string | null;
    role?: string;
    pegawai?: {
      unit_pegawai?: string | null;
    } | null;
  } | null;
  ormawa?: {
    nama: string;
  } | null;
  peminjamanSarana?: Array<{
    jumlah: number;
    sarana: {
      nama: string;
    };
  }>;
  peminjamanPrasarana?: Array<{
    prasarana: {
      nama: string;
    };
  }>;
}

interface EventDetailsProps {
  selectedDate?: Date;
  className?: string;
  events?: CalendarEvent[]; // Accept events from parent to avoid duplicate API calls
  onRefresh?: () => void; // Callback to refresh events after marking deletion
  currentUserEmail?: string | null; // Current user email for delete permission check
}

export function EventDetails({ selectedDate, className, events: parentEvents, onRefresh, currentUserEmail }: EventDetailsProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedDate) {
      setEvents([]);
      setLoading(false);
      return;
    }

    // If parent provides events, filter them instead of making API call
    if (parentEvents && parentEvents.length > 0) {
      const dayEvents = parentEvents.filter((event: any) => {
        if (!event.tanggal_acara_dimulai) return false;
        return isSameDay(new Date(event.tanggal_acara_dimulai), selectedDate);
      });
      setEvents(dayEvents);
      setLoading(false);
      return;
    }

    // Check if parent events is explicitly empty array (indicating refresh/loading state)
    if (parentEvents && parentEvents.length === 0) {
      setEvents([]);
      setLoading(true);
      return;
    }

    // Fallback to API call if no parent events provided
    let isCancelled = false;

    const fetchEvents = async () => {
      setLoading(true);
      try {
        const result = await getCalendarEventsAction({
          startDate: selectedDate,
          endDate: selectedDate,
          limit: 20, // Reduced limit for details view
        });

        if (!isCancelled && result?.data?.data) {
          const dayEvents = result.data.data.filter((event: any) => {
            if (!event.tanggal_acara_dimulai) return false;
            return isSameDay(new Date(event.tanggal_acara_dimulai), selectedDate);
          });
          setEvents(dayEvents as unknown as CalendarEvent[]);
        } else if (!isCancelled) {
          setEvents([]);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("Error fetching events:", error);
          setEvents([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    const debounceTimer = setTimeout(fetchEvents, 200);

    return () => {
      isCancelled = true;
      clearTimeout(debounceTimer);
    };
  }, [selectedDate, parentEvents]);

  const getStatusBadge = (status: string, statusPengajuan: string, type?: string) => {
    if (type === 'marking') {
      switch (status) {
        case "AKTIF":
          return <Badge className="bg-gray-500 hover:bg-gray-600">Aktif</Badge>;
        case "SELESAI":
          return <Badge className="bg-green-500 hover:bg-green-600">Selesai</Badge>;
        case "DIBATALKAN":
          return <Badge variant="destructive">Dibatalkan</Badge>;
        default:
          return <Badge variant="outline">{status}</Badge>;
      }
    }

    if (statusPengajuan === "PENGAJUAN_DITOLAK") {
      return <Badge variant="destructive">Ditolak</Badge>;
    }
    
    switch (status) {
      case "DALAM_PROSES":
        return <Badge variant="secondary">Dalam Proses</Badge>;
      case "DITERIMA":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Diterima</Badge>;
      case "SELESAI":
        return <Badge className="bg-green-500 hover:bg-green-600">Selesai</Badge>;
      case "DIBATALKAN":
        return <Badge variant="destructive">Dibatalkan</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTime = (dateTime: Date | null) => {
    if (!dateTime) return "";
    const date = new Date(dateTime);
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-blue-500" />
          {selectedDate ? format(selectedDate, "dd MMMM yyyy", { locale: id }) : "Pilih Tanggal"}
        </CardTitle>
        {selectedDate && (
          <Badge variant="outline" className="w-fit">
            {events.length} events
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-4 h-4 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              Memuat acara...
            </div>
          </div>
        ) : !selectedDate ? (
          <div className="text-center py-8">
            <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-400 opacity-50" />
            <p className="text-sm text-gray-500">Pilih tanggal untuk melihat events</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8">
            <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-400 opacity-50" />
            <p className="text-sm text-gray-500">Tidak ada events pada tanggal ini</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {events.map((event) => {

              
              return (
              <EventDetailDialog key={event.id} event={event} onRefresh={onRefresh} currentUserEmail={currentUserEmail}>
                <div className="p-3 hover:bg-gray-50 cursor-pointer rounded-lg border transition-colors">
                  <div className="space-y-1">
                    {/* Nama Acara dengan Badge */}
                    <div className="flex items-start gap-2 flex-wrap">
                      <h4 className="font-medium text-sm text-gray-900 overflow-hidden flex-1 min-w-0" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {event.nama_acara}
                      </h4>
                      {/* Ormawa/Unit Pegawai Badge */}
                      {event.ormawa?.nama && (
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-200 flex-shrink-0">
                          {event.ormawa.nama}
                        </Badge>
                      )}
                      {(event.user?.pegawai?.unit_pegawai || event.unit_pegawai) && (
                        <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 border-purple-200 flex-shrink-0">
                          {event.user?.pegawai?.unit_pegawai || event.unit_pegawai}
                        </Badge>
                      )}
                      {/* Status Badge */}
                      {event.type === 'peminjaman' ? (
                        <>
                          {(event.status_peminjaman === 'DITERIMA' || event.status_pengajuan === 'PENGAJUAN_DITERIMA') && (
                            <Badge className="text-xs bg-green-100 text-green-700 border-green-300 flex-shrink-0">
                              ✓ Sudah Diterima
                            </Badge>
                          )}
                          {event.status_pengajuan === 'MENUNGGU_PENINJAUAN' && (
                            <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700 border-yellow-300 flex-shrink-0">
                              ⏳ Menunggu Validasi
                            </Badge>
                          )}
                        </>
                      ) : event.type === 'marking' && (
                        <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 border-gray-200 flex-shrink-0">
                          📌 Marking
                        </Badge>
                      )}
                    </div>

                    {/* Waktu */}
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Clock className="w-3 h-3" />
                      <span>
                        {event.type === 'marking' && event.waktu_mulai ? (
                          `${event.waktu_mulai}${event.waktu_berakhir ? ` - ${event.waktu_berakhir}` : ''}`
                        ) : (
                          `${formatTime(event.tanggal_acara_dimulai)} - ${formatTime(event.tanggal_acara_berakhir)}`
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </EventDetailDialog>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
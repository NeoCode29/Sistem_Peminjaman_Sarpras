"use client";

import { useState, useEffect, useTransition } from "react";
import { format, isSameDay } from "date-fns";
import { id } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminCalendar } from "./AdminCalendar";
import { 
  CalendarIcon, 
  Clock, 
  FileText, 
  Package,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building2,
  Activity
} from "lucide-react";
import { StatusPeminjaman, StatusPengajuan } from "@prisma/client";
import { toast } from "sonner";
import { 
  getDashboardStatsAction, 
  getCalendarEventsForMonthAction
} from "@/actions/dashboardActions";
import type { DashboardStats, CalendarEvent } from "@/service/dashboardService";

interface AdminDashboardClientProps {
  initialStats: DashboardStats;
  initialEvents: CalendarEvent[];
}

export function AdminDashboardClient({ 
  initialStats, 
  initialEvents 
}: AdminDashboardClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [lastFetchKey, setLastFetchKey] = useState<string>("");

  // Handle month changes in AdminCalendar
  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  // Fetch events when month changes
  useEffect(() => {
    const fetchKey = `calendar-${format(currentDate, 'yyyy-MM')}`;
    
    if (fetchKey === lastFetchKey) {
      return;
    }

    const fetchMonthEvents = async () => {
      setIsLoading(true);
      
      startTransition(async () => {
        try {
          const result = await getCalendarEventsForMonthAction(currentDate);
          
          if (result.success && result.data) {
            setEvents(result.data);
            setLastFetchKey(fetchKey);
          } else {
            toast.error(result.message || "Gagal mengambil data kalender");
          }
        } catch (error) {
          toast.error("Terjadi kesalahan saat mengambil data kalender");
        } finally {
          setIsLoading(false);
        }
      });
    };

    fetchMonthEvents();
  }, [currentDate, lastFetchKey]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const getStatusBadge = (status: StatusPeminjaman, statusPengajuan: StatusPengajuan) => {
    if (statusPengajuan === "PENGAJUAN_DITOLAK") {
      return <Badge variant="destructive">Ditolak</Badge>;
    }
    
    switch (status) {
      case "DALAM_PROSES":
        return <Badge variant="secondary">Dalam Proses</Badge>;
      case "DITERIMA":
        return <Badge variant="default" className="bg-blue-500">Diterima</Badge>;
      case "SELESAI":
        return <Badge variant="default" className="bg-green-500">Selesai</Badge>;
      case "DIBATALKAN":
        return <Badge variant="destructive">Dibatalkan</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTime = (date: Date) => {
    return format(date, "HH:mm", { locale: id });
  };

  // Get events for selected date - include all events (peminjaman and marking)
  const selectedDateEvents = selectedDate ? events.filter(event => 
    event.tanggal_acara_dimulai && isSameDay(new Date(event.tanggal_acara_dimulai), selectedDate)
  ) : [];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="group relative overflow-hidden bg-white hover:shadow-2xl transition-all duration-300 border-0 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50"></div>
              <CardHeader className="relative flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Total Peminjaman
                </CardTitle>
                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                  <FileText className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative space-y-3">
                <div className="text-3xl font-bold text-gray-900">{stats.totalPeminjaman}</div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full shadow"></div>
                    <span className="text-gray-600 font-medium">{stats.peminjamanSelesai} selesai</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-blue-500 rounded-full shadow"></div>
                    <span className="text-gray-600 font-medium">{stats.peminjamanAktif} aktif</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden bg-white hover:shadow-2xl transition-all duration-300 border-0 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-50"></div>
              <CardHeader className="relative flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Peminjaman Aktif
                </CardTitle>
                <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md">
                  <Activity className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative space-y-3">
                <div className="text-3xl font-bold text-green-600">{stats.peminjamanAktif}</div>
                <p className="text-xs text-gray-600 font-medium">Sedang berlangsung</p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden bg-white hover:shadow-2xl transition-all duration-300 border-0 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-violet-50 opacity-50"></div>
              <CardHeader className="relative flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Total Sarana
                </CardTitle>
                <div className="p-2.5 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-md">
                  <Package className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative space-y-3">
                <div className="text-3xl font-bold text-gray-900">{stats.totalSarana}</div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full shadow"></div>
                    <span className="text-gray-600 font-medium">{stats.saranaAktif} tersedia</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-orange-500 rounded-full shadow"></div>
                    <span className="text-gray-600 font-medium">{stats.saranaDipinjam} dipinjam</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden bg-white hover:shadow-2xl transition-all duration-300 border-0 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-blue-50 opacity-50"></div>
              <CardHeader className="relative flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Total Prasarana
                </CardTitle>
                <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl shadow-md">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative space-y-3">
                <div className="text-3xl font-bold text-gray-900">{stats.totalPrasarana}</div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full shadow"></div>
                    <span className="text-gray-600 font-medium">{stats.prasaranaAktif} tersedia</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-orange-500 rounded-full shadow"></div>
                    <span className="text-gray-600 font-medium">{stats.prasaranaDipinjam} dipinjam</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-xl border-0">
              <div className="absolute inset-0 bg-white/10"></div>
              <CardHeader className="relative flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-green-100">
                  Peminjaman Selesai
                </CardTitle>
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative space-y-2">
                <div className="text-3xl font-bold">{stats.peminjamanSelesai}</div>
                <p className="text-sm text-green-100">Berhasil dikembalikan</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-xl border-0">
              <div className="absolute inset-0 bg-white/10"></div>
              <CardHeader className="relative flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-red-100">
                  Peminjaman Ditolak
                </CardTitle>
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <XCircle className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative space-y-2">
                <div className="text-3xl font-bold">{stats.peminjamanDitolak}</div>
                <p className="text-sm text-red-100">Tidak disetujui</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl border-0">
              <div className="absolute inset-0 bg-white/10"></div>
              <CardHeader className="relative flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-amber-100">
                  Menunggu Persetujuan
                </CardTitle>
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative space-y-2">
                <div className="text-3xl font-bold">{stats.peminjamanPending}</div>
                <p className="text-sm text-amber-100">Perlu ditinjau</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CalendarIcon className="w-6 h-6" />
              Kalender Peminjaman Sarana & Prasarana
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Lihat jadwal penggunaan sarana dan prasarana dari semua peminjam. Klik tanggal untuk melihat detail acara.
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3">
                    <AdminCalendar 
                      onDateSelect={handleDateSelect}
                      selectedDate={selectedDate}
                      events={events}
                      currentDate={currentDate}
                      onDateChange={handleDateChange}
                    />
                </div>

                <div className="lg:col-span-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      {selectedDate ? format(selectedDate, "dd MMMM yyyy", { locale: id }) : "Pilih Tanggal"}
                    </h3>
                    <Badge variant="outline" className="mb-4">
                      {selectedDateEvents.length} acara
                    </Badge>
                  </div>

                  {selectedDateEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500 text-sm">
                        {selectedDate ? "Tidak ada acara pada tanggal ini" : "Klik tanggal untuk melihat acara"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {selectedDateEvents.map((event) => {
                        const isMarking = (!event.peminjamanSarana || event.peminjamanSarana.length === 0) && 
                                         (!event.peminjamanPrasarana || event.peminjamanPrasarana.length === 0);
                        
                        return (
                          <div 
                            key={event.id} 
                            className={`p-3 border rounded-lg transition-colors ${
                              isMarking 
                                ? 'border-purple-200 bg-purple-50 hover:bg-purple-100' 
                                : 'border-gray-200 hover:bg-gray-50 cursor-pointer'
                            }`}
                            onClick={() => !isMarking && window.open(`/admin/peminjaman/${event.id}`, '_blank')}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4 className="font-medium text-sm text-gray-900 leading-tight">{event.nama_acara}</h4>
                              <div className="flex gap-2">
                                {isMarking && (
                                  <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-200">
                                    Marking
                                  </Badge>
                                )}
                                {getStatusBadge(event.status_peminjaman, event.status_pengajuan)}
                              </div>
                            </div>
                            
                            {event.tanggal_acara_dimulai && event.tanggal_acara_berakhir && (
                              <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {formatTime(new Date(event.tanggal_acara_dimulai))} - {formatTime(new Date(event.tanggal_acara_berakhir))}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                {event.ormawa?.nama || event.unit_pegawai || event.user.name || event.user.email?.split('@')[0] || 'Unknown'}
                              </Badge>
                            </div>
                            
                            {!isMarking && (
                              <p className="text-xs text-gray-500 mt-1">Klik untuk melihat detail peminjaman</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Keterangan Status</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-blue-500"></div>
                        <span>Diterima</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-green-500"></div>
                        <span>Selesai</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-yellow-500"></div>
                        <span>Dalam Proses</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-gray-500"></div>
                        <span>Lainnya</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 

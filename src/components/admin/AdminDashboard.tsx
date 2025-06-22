"use client";

import { useState, useEffect } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, isSameDay, startOfDay } from "date-fns";
import { id } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SimpleCalendar } from "../peminjam/SimpleCalendar";
import { 
  CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Package,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building2
} from "lucide-react";
import { getCalendarEventsAction } from "@/actions/peminjamanActions";
import { StatusPeminjaman, StatusPengajuan } from "@prisma/client";
import { cn } from "@/lib/utils";

interface CalendarPeminjaman {
  id: string;
  nama_acara: string;
  tanggal_acara_dimulai: Date | null;
  tanggal_acara_berakhir: Date | null;
  jumlah_peserta: number;
  status_peminjaman: StatusPeminjaman;
  status_pengajuan: StatusPengajuan;
  user: {
    name: string | null;
    email: string | null;
  };
  peminjamanSarana: Array<{
    jumlah: number;
    sarana: {
      nama: string;
    };
  }>;
  peminjamanPrasarana: Array<{
    prasarana: {
      nama: string;
    };
  }>;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: CalendarPeminjaman;
}

interface DashboardStats {
  totalPeminjaman: number;
  peminjamanAktif: number;
  peminjamanSelesai: number;
  peminjamanDitolak: number;
  peminjamanPending: number;
  totalSarana: number;
  saranaAktif: number;
  totalPrasarana: number;
  prasaranaAktif: number;
}

interface AdminDashboardProps {
  adminId: string;
}

export function AdminDashboard({ adminId }: AdminDashboardProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalPeminjaman: 0,
    peminjamanAktif: 0,
    peminjamanSelesai: 0,
    peminjamanDitolak: 0,
    peminjamanPending: 0,
    totalSarana: 0,
    saranaAktif: 0,
    totalPrasarana: 0,
    prasaranaAktif: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchKey, setLastFetchKey] = useState<string>("");

  // Fetch statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [peminjamanResponse, saranaResponse, prasaranaResponse] = await Promise.all([
          fetch('/api/peminjaman/stats'),
          fetch('/api/sarana/stats'),
          fetch('/api/prasarana/stats')
        ]);

        const peminjamanStats = await peminjamanResponse.json();
        const saranaStats = await saranaResponse.json();
        const prasaranaStats = await prasaranaResponse.json();

        setStats({
          totalPeminjaman: peminjamanStats.total || 0,
          peminjamanAktif: peminjamanStats.aktif || 0,
          peminjamanSelesai: peminjamanStats.selesai || 0,
          peminjamanDitolak: peminjamanStats.ditolak || 0,
          peminjamanPending: peminjamanStats.pending || 0,
          totalSarana: saranaStats.total || 0,
          saranaAktif: saranaStats.aktif || 0,
          totalPrasarana: prasaranaStats.total || 0,
          prasaranaAktif: prasaranaStats.aktif || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  // Fetch data for current month - ALL events from all users
  useEffect(() => {
    const startDate = startOfMonth(currentDate);
    const endDate = endOfMonth(currentDate);
    const fetchKey = `calendar-${format(startDate, 'yyyy-MM')}`;
    
    // Skip fetch if we already fetched this month's data
    if (fetchKey === lastFetchKey) {
      return;
    }
    
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch all events for admin calendar view
        const result = await getCalendarEventsAction({
          startDate,
          endDate,
          limit: 1000,
        });

        if (result?.data?.data) {
          const calendarEvents: CalendarEvent[] = result.data.data.map((peminjaman: any) => ({
            id: peminjaman.id,
            title: peminjaman.nama_acara,
            start: new Date(peminjaman.tanggal_acara_dimulai || new Date()),
            end: new Date(peminjaman.tanggal_acara_berakhir || new Date()),
            resource: peminjaman as CalendarPeminjaman,
          }));
          
          setEvents(calendarEvents);
        } else {
          setEvents([]);
        }
        setLastFetchKey(fetchKey);
      } catch (error) {
        console.error("Error fetching events:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch events");
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [currentDate, lastFetchKey]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
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

  const formatDateTime = (date: Date) => {
    return format(date, "dd MMMM yyyy, HH:mm", { locale: id });
  };

  const formatTime = (date: Date) => {
    return format(date, "HH:mm", { locale: id });
  };

  // Get events for selected date
  const selectedDateEvents = selectedDate ? events.filter(event => 
    isSameDay(event.start, selectedDate) || 
    (event.start <= selectedDate && event.end >= selectedDate)
  ) : [];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Peminjaman */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Peminjaman</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPeminjaman}</div>
            <p className="text-xs text-muted-foreground">
              {stats.peminjamanAktif} aktif • {stats.peminjamanSelesai} selesai
            </p>
          </CardContent>
        </Card>

        {/* Peminjaman Aktif */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peminjaman Aktif</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.peminjamanAktif}</div>
            <p className="text-xs text-muted-foreground">
              Sedang berlangsung
            </p>
          </CardContent>
        </Card>

        {/* Total Sarana */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sarana</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSarana}</div>
            <p className="text-xs text-muted-foreground">
              {stats.saranaAktif} tersedia
            </p>
          </CardContent>
        </Card>

        {/* Total Prasarana */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prasarana</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPrasarana}</div>
            <p className="text-xs text-muted-foreground">
              {stats.prasaranaAktif} tersedia
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Peminjaman Selesai</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.peminjamanSelesai}</div>
            <p className="text-xs text-green-700">
              Berhasil dikembalikan
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Peminjaman Ditolak</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.peminjamanDitolak}</div>
            <p className="text-xs text-red-700">
              Tidak disetujui
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Menunggu Persetujuan</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.peminjamanPending}
            </div>
            <p className="text-xs text-yellow-700">
              Perlu ditinjau
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Calendar Card */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <CalendarIcon className="w-6 h-6" />
              Kalender Peminjaman Sarana & Prasarana
            </CardTitle>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevMonth}
                className="px-3"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xl font-semibold min-w-[220px] text-center">
                {format(currentDate, "MMMM yyyy", { locale: id })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
                className="px-3"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Lihat dan kelola jadwal penggunaan sarana dan prasarana dari semua peminjam. Klik tanggal untuk melihat detail acara.
          </p>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
              <div className="text-red-500 text-center">
                <p className="font-semibold">Error loading events</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Simple Calendar */}
              <div className="lg:col-span-1">
                <SimpleCalendar 
                  onDateSelect={handleDateSelect}
                  selectedDate={selectedDate}
                />
              </div>

              {/* Events List for Selected Date */}
              <div className="lg:col-span-2 space-y-4">
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
                    <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground text-sm">
                      {selectedDate ? "Tidak ada acara pada tanggal ini" : "Klik tanggal untuk melihat acara"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {selectedDateEvents.map((event) => (
                      <Card 
                        key={event.id} 
                        className="cursor-pointer transition-all hover:shadow-md border-l-4"
                        style={{ 
                          borderLeftColor: event.resource.status_peminjaman === "SELESAI" ? "#22c55e" : 
                                          event.resource.status_peminjaman === "DITERIMA" ? "#3b82f6" : 
                                          event.resource.status_peminjaman === "DALAM_PROSES" ? "#f59e0b" : "#6b7280" 
                        }}
                        onClick={() => window.open(`/admin/peminjaman/${event.resource.id}`, '_blank')}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <h4 className="font-semibold text-sm leading-tight">{event.title}</h4>
                              {getStatusBadge(event.resource.status_peminjaman, event.resource.status_pengajuan)}
                            </div>
                            
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{formatTime(event.start)} - {formatTime(event.end)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>{event.resource.jumlah_peserta} peserta</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>Peminjam: {event.resource.user.name || event.resource.user.email}</span>
                              </div>
                            </div>

                            {/* Quick Items Summary */}
                            <div className="text-xs space-y-1">
                              {event.resource.peminjamanSarana.length > 0 && (
                                <p className="text-muted-foreground truncate">
                                  <span className="font-medium">Sarana:</span> {
                                    event.resource.peminjamanSarana.slice(0, 2).map(item => 
                                      `${item.sarana.nama} (${item.jumlah})`
                                    ).join(', ')
                                  }{event.resource.peminjamanSarana.length > 2 && '...'}
                                </p>
                              )}
                              {event.resource.peminjamanPrasarana.length > 0 && (
                                <p className="text-muted-foreground truncate">
                                  <span className="font-medium">Prasarana:</span> {
                                    event.resource.peminjamanPrasarana.slice(0, 2).map(item => 
                                      item.prasarana.nama
                                    ).join(', ')
                                  }{event.resource.peminjamanPrasarana.length > 2 && '...'}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Legend */}
                <Card className="mt-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Keterangan Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded bg-blue-500"></div>
                      <span>Diterima</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded bg-green-500"></div>
                      <span>Selesai</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded bg-yellow-500"></div>
                      <span>Dalam Proses</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded bg-gray-500"></div>
                      <span>Lainnya</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 
"use client";
import { useState, useEffect, useMemo } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from "date-fns";
import { id } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, Dot } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCalendarEventsAction } from "@/actions/peminjamanActions";

interface CalendarEvent {
  id: string;
  nama_acara: string;
  deskripsi_acara?: string | null;
  tanggal_acara_dimulai: Date | null;
  tanggal_acara_berakhir: Date | null;
  jumlah_peserta?: number;
  status_peminjaman: string;
  status_pengajuan: string;
  type: 'peminjaman' | 'marking'; // Tambah type untuk membedakan
  // Marking-specific fields
  lokasi?: string | null;
  lokasi_manual?: string | null;
  waktu_mulai?: string | null;
  waktu_berakhir?: string | null;
  unit_pegawai?: string | null;
  // Common fields
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
}

interface SimpleCalendarProps {
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
  className?: string;
  showEvents?: boolean;
  onEventsLoad?: (events: CalendarEvent[]) => void; // Callback to share events with parent
}

export function SimpleCalendar({ onDateSelect, selectedDate, className, showEvents = true, onEventsLoad }: SimpleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastFetchKey, setLastFetchKey] = useState<string>("");

  // Fetch events for current month with caching
  useEffect(() => {
    if (!showEvents) return;

    let isCancelled = false;
    const controller = new AbortController();

    // Create a unique key for this fetch
    const fetchKey = `${format(currentDate, 'yyyy-MM')}`;
    
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const startDate = startOfMonth(currentDate);
        const endDate = endOfMonth(currentDate);
        
        // Fetch both peminjaman and marking data
        const [peminjamanResult, markingResult] = await Promise.all([
          getCalendarEventsAction({
            startDate,
            endDate,
            limit: 50,
          }),
          fetch('/api/marking').then(res => res.ok ? res.json() : [])
        ]);

        if (!isCancelled) {
          const allEvents: CalendarEvent[] = [];
          
          // Add peminjaman events
          if (peminjamanResult?.data?.data) {
            allEvents.push(...peminjamanResult.data.data.map((event: any) => ({
              ...event,
              type: 'peminjaman' as const
            })));
          }

          // Add marking events (filter by date range)
          if (markingResult && Array.isArray(markingResult)) {
            const markingEvents = markingResult
              .filter((marking: any) => {
                const markingDate = new Date(marking.tanggal_acara_dimulai);
                return markingDate >= startDate && markingDate <= endDate;
              })
              .map((marking: any) => ({
                id: marking.id,
                nama_acara: marking.nama_acara,
                deskripsi_acara: marking.deskripsi,
                tanggal_acara_dimulai: marking.tanggal_acara_dimulai,
                tanggal_acara_berakhir: marking.tanggal_acara_berakhir,
                jumlah_peserta: marking.jumlah_peserta || 0,
                status_peminjaman: marking.status,
                status_pengajuan: marking.status,
                type: 'marking' as const,
                // Add marking-specific fields
                lokasi: marking.lokasi,
                lokasi_manual: marking.lokasi_manual,
                waktu_mulai: marking.waktu_mulai,
                waktu_berakhir: marking.waktu_berakhir,
                unit_pegawai: marking.unit_pegawai,
                // Add default values for missing fields that EventDetailDialog expects
                peminjamanSarana: [],
                peminjamanPrasarana: [],
                user: marking.user,
                ormawa: marking.ormawa
              }));
            
            allEvents.push(...markingEvents);
          }

          setEvents(allEvents);
          setLastFetchKey(fetchKey);
          onEventsLoad?.(allEvents);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("Error fetching events:", error);
          setEvents([]);
          onEventsLoad?.([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    const debounceTimer = setTimeout(fetchEvents, 100); // Debounce API calls

    return () => {
      isCancelled = true;
      controller.abort();
      clearTimeout(debounceTimer);
    };
  }, [currentDate, showEvents, onEventsLoad]);

  // Memoized event mapping for performance
  const eventsByDate = useMemo(() => {
    if (!showEvents) return new Map();
    
    const dateMap = new Map<string, CalendarEvent[]>();
    
    events.forEach(event => {
      if (!event.tanggal_acara_dimulai) return;
      
      const eventDate = new Date(event.tanggal_acara_dimulai);
      const dateKey = format(eventDate, 'yyyy-MM-dd');
      
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, []);
      }
      dateMap.get(dateKey)!.push(event);
    });
    
    return dateMap;
  }, [events, showEvents]);

  // Helper function to check if a date has events
  const hasEvents = (date: Date) => {
    if (!showEvents) return false;
    const dateKey = format(date, 'yyyy-MM-dd');
    return eventsByDate.has(dateKey);
  };

  // Get event count for a date
  const getEventCount = (date: Date) => {
    if (!showEvents) return 0;
    const dateKey = format(date, 'yyyy-MM-dd');
    return eventsByDate.get(dateKey)?.length || 0;
  };

  // Get event types for a date to determine bullet color
  const getEventTypes = (date: Date) => {
    if (!showEvents) return { validated: 0, pending: 0, marking: 0 };
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayEvents = eventsByDate.get(dateKey) || [];
    
    return dayEvents.reduce((acc: { validated: number; pending: number; marking: number }, event: CalendarEvent) => {
      if (event.type === 'marking') {
        acc.marking++;
      } else if (event.type === 'peminjaman') {
        if (event.status_peminjaman === 'DITERIMA' || event.status_pengajuan === 'PENGAJUAN_DITERIMA') {
          acc.validated++;
        } else if (event.status_pengajuan === 'MENUNGGU_PENINJAUAN') {
          acc.pending++;
        }
      }
      return acc;
    }, { validated: 0, pending: 0, marking: 0 });
  };

  // Determine primary bullet color based on priority: validated > pending > marking
  const getBulletColor = (date: Date) => {
    const types = getEventTypes(date);
    if (types.validated > 0) return 'green'; // Hijau untuk yang divalidasi
    if (types.pending > 0) return 'yellow'; // Kuning untuk menunggu validasi
    if (types.marking > 0) return 'gray'; // Abu-abu untuk marking
    return 'gray';
  };

  // Memoized calendar grid for performance
  const calendarGrid = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start week on Monday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    // Generate calendar days
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        const dayHasEvents = hasEvents(cloneDay);
        const eventCount = getEventCount(cloneDay);
        const bulletColor = getBulletColor(cloneDay);
        const isCurrentMonth = isSameMonth(day, monthStart);
        
        days.push(
          <div
            key={day.toString()}
            className={cn(
              "relative h-16 sm:h-20 w-full flex flex-col items-center justify-center text-sm sm:text-base cursor-pointer transition-all duration-200 rounded-lg group border-2",
              loading && "opacity-70 pointer-events-none",
              !isCurrentMonth && "text-gray-400 bg-gray-50/30 border-gray-200/50",
              isCurrentMonth && !dayHasEvents && "bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:shadow-lg",
              isCurrentMonth && dayHasEvents && !isToday(day) && !(selectedDate && isSameDay(day, selectedDate)) && "bg-gradient-to-br from-green-50 to-blue-50 border-green-300 shadow-sm",
              isToday(day) && "bg-blue-600 text-white font-bold shadow-xl border-blue-600 ring-2 ring-blue-300",
              selectedDate && isSameDay(day, selectedDate) && !isToday(day) && "bg-blue-100 text-blue-800 font-semibold shadow-lg border-blue-400 ring-2 ring-blue-200"
            )}
            onClick={() => {
              if (isCurrentMonth && !loading) {
                onDateSelect?.(cloneDay);
              }
            }}
          >
            <span className="text-base sm:text-lg font-semibold mb-1">{formattedDate}</span>
            {dayHasEvents && isCurrentMonth && !loading && (
              <div className="absolute bottom-1 sm:bottom-2 flex items-center justify-center w-full">
                <div className={cn(
                  "w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm border-2",
                  bulletColor === 'green' && "bg-green-500 text-white border-green-600",
                  bulletColor === 'yellow' && "bg-yellow-500 text-white border-yellow-600", 
                  bulletColor === 'gray' && "bg-gray-500 text-white border-gray-600",
                  isToday(day) && "ring-2 ring-white"
                )}>
                  {eventCount}
                </div>
              </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-1 sm:gap-2" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return rows;
  }, [currentDate, eventsByDate, selectedDate, loading]);

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  // Day headers with better styling
  const dayHeaders = ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN'];

  return (
    <Card className={cn("w-full shadow-lg", className)}>
      <CardHeader className="pb-2 sm:pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
            <span className="hidden sm:inline">Kalender Peminjaman</span>
            <span className="sm:hidden">Kalender</span>
          </CardTitle>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevMonth}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-blue-50"
              disabled={loading}
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <div className="text-sm sm:text-lg font-bold min-w-[120px] sm:min-w-[180px] text-center text-blue-700">
              {format(currentDate, "MMM yyyy", { locale: id })}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextMonth}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-blue-50"
              disabled={loading}
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-0 p-3 sm:p-6 pt-0">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3">
          {dayHeaders.map((day) => (
            <div
              key={day}
              className="h-8 sm:h-12 flex items-center justify-center text-xs sm:text-sm font-bold text-gray-700 bg-blue-50 border border-blue-200 rounded-lg"
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="space-y-1 sm:space-y-2 border-2 border-blue-100 rounded-xl p-1 sm:p-2 bg-gradient-to-br from-blue-50/30 to-white">
          {calendarGrid}
        </div>
        
        {/* Legend and info */}
        <div className="pt-4 space-y-3">
          <div className="text-center">
            <div className="text-xs text-gray-500">
              {format(new Date(), "dd MMMM yyyy", { locale: id })}
            </div>
          </div>
          
          {showEvents && (
            <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-green-600 text-white flex items-center justify-center text-xs font-bold">✓</div>
                <span className="font-medium text-green-700">Divalidasi</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-yellow-600 text-white flex items-center justify-center text-xs font-bold">?</div>
                <span className="font-medium text-yellow-700">Menunggu</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-500 border-2 border-gray-600 text-white flex items-center justify-center text-xs font-bold">M</div>
                <span className="font-medium text-gray-700">Marking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-600 ring-2 ring-blue-300"></div>
                <span className="font-medium text-blue-700">Hari Ini</span>
              </div>
            </div>
          )}
          
          {loading && (
            <div className="text-center">
              <div className="text-xs text-gray-500 flex items-center justify-center gap-2">
                <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                Memuat acara...
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 
"use client";

import { useMemo } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from "date-fns";
import { id } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/service/dashboardService";

interface AdminCalendarProps {
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
  events: CalendarEvent[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export function AdminCalendar({ 
  onDateSelect, 
  selectedDate, 
  events,
  currentDate,
  onDateChange
}: AdminCalendarProps) {
  
  // Memoized event mapping for performance
  const eventsByDate = useMemo(() => {
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
  }, [events]);

  // Helper function to check if a date has events
  const hasEvents = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return eventsByDate.has(dateKey);
  };

  // Get event count for a date
  const getEventCount = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return eventsByDate.get(dateKey)?.length || 0;
  };

  // Get event types for a date to determine bullet color
  const getEventTypes = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayEvents = eventsByDate.get(dateKey) || [];
    
    return dayEvents.reduce((acc: { validated: number; pending: number; marking: number }, event: CalendarEvent) => {
      const isMarking = (!event.peminjamanSarana || event.peminjamanSarana.length === 0) && 
                       (!event.peminjamanPrasarana || event.peminjamanPrasarana.length === 0);
      
      if (isMarking) {
        acc.marking++;
      } else if (event.status_peminjaman === 'DITERIMA' || event.status_pengajuan === 'PENGAJUAN_DITERIMA') {
        acc.validated++;
      } else if (event.status_pengajuan === 'MENUNGGU_PENINJAUAN') {
        acc.pending++;
      }
      return acc;
    }, { validated: 0, pending: 0, marking: 0 });
  };

  // Determine primary bullet color based on priority: validated > pending > marking
  const getBulletColor = (date: Date) => {
    const types = getEventTypes(date);
    if (types.validated > 0) return 'green';
    if (types.pending > 0) return 'yellow';
    if (types.marking > 0) return 'purple';
    return 'gray';
  };

  const nextMonth = () => {
    onDateChange(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    onDateChange(subMonths(currentDate, 1));
  };

  // Memoized calendar grid for performance
  const calendarGrid = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

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
              !isCurrentMonth && "text-gray-400 bg-gray-50/30 border-gray-200/50",
              isCurrentMonth && !dayHasEvents && "bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:shadow-lg",
              isCurrentMonth && dayHasEvents && !isToday(day) && !(selectedDate && isSameDay(day, selectedDate)) && "bg-gradient-to-br from-green-50 to-blue-50 border-green-300 shadow-sm",
              isToday(day) && "bg-blue-600 text-white font-bold shadow-xl border-blue-600 ring-2 ring-blue-300",
              selectedDate && isSameDay(day, selectedDate) && !isToday(day) && "bg-blue-100 text-blue-800 font-semibold shadow-lg border-blue-400 ring-2 ring-blue-200"
            )}
            onClick={() => onDateSelect?.(cloneDay)}
          >
            <span className="relative z-10">{formattedDate}</span>
            
            {dayHasEvents && (
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex items-center gap-0.5">
                <div className={cn(
                  "w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm",
                  bulletColor === 'green' && "bg-green-600 ring-2 ring-green-300",
                  bulletColor === 'yellow' && "bg-yellow-500 ring-2 ring-yellow-300", 
                  bulletColor === 'purple' && "bg-purple-500 ring-2 ring-purple-300",
                  bulletColor === 'gray' && "bg-gray-500 text-white border-2 border-gray-600"
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
    return <div className="space-y-1 sm:space-y-2">{rows}</div>;
  }, [currentDate, eventsByDate, selectedDate, onDateSelect]);

  return (
    <Card className="w-full bg-white shadow-lg border-0">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            {format(currentDate, "MMMM yyyy", { locale: id })}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevMonth}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-blue-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextMonth}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-blue-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-4">
          {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => (
            <div
              key={day}
              className="h-8 sm:h-12 flex items-center justify-center text-xs sm:text-sm font-bold text-gray-700 bg-blue-50 border border-blue-200 rounded-lg"
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        {calendarGrid}
        
        {/* Legend */}
        <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs border-t pt-3 sm:pt-4">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-green-600 ring-2 ring-green-300"></div>
            <span className="text-gray-600">Peminjaman Disetujui</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-yellow-500 ring-2 ring-yellow-300"></div>
            <span className="text-gray-600">Menunggu Persetujuan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-purple-500 ring-2 ring-purple-300"></div>
            <span className="text-gray-600">Marking Acara</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
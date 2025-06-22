'use client';

import { useState, useCallback } from 'react';
import { SimpleCalendar } from '@/components/peminjam/SimpleCalendar';
import { EventDetails } from '@/components/peminjam/EventDetails';
import { MarkingDialog } from '@/components/peminjam/MarkingDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Plus, MapPin, FileText } from 'lucide-react';
import Link from 'next/link';

interface PeminjamDashboardClientProps {
  session: {
    user: {
      name?: string | null;
      email?: string | null;
      id: string;
      role: string;
    };
  };
}

export function PeminjamDashboardClient({ session }: PeminjamDashboardClientProps) {
  // Set tanggal hari ini sebagai default selectedDate
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [markingDialogOpen, setMarkingDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleMarkingSuccess = useCallback(() => {
    // Refresh calendar events when a new marking is created
    setIsRefreshing(true);
    setCalendarEvents([]); // Clear events first
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleRefresh = useCallback(() => {
    // Force refresh calendar and events
    setIsRefreshing(true);
    setCalendarEvents([]); // Clear events first
    setRefreshKey(prev => prev + 1);
  }, []);

  // Ensure events are loaded when calendar events change
  const handleEventsLoad = useCallback((events: any[]) => {
    setCalendarEvents(events);
    setIsRefreshing(false); // Reset refreshing state when data is loaded
  }, []);

  // Handle date selection with callback
  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-6xl">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Beranda Peminjam</h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          Selamat datang, {session.user.name}! Kelola peminjaman sarana dan prasarana Anda.
        </p>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 sm:gap-6">
        {/* Calendar and Quick Actions */}
        <div className="xl:col-span-3 space-y-3 sm:space-y-4">
          {/* Quick Actions - Mobile-First Responsive Design */}
          <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4">
            {/* Primary Action - Full width on mobile */}
            <Button 
              asChild 
              className="w-full justify-center h-14 sm:h-11 text-base sm:text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Link href="/peminjam/peminjaman" className="flex items-center">
                <Plus className="w-5 h-5 sm:w-4 sm:h-4 mr-3 sm:mr-2 flex-shrink-0" />
                <span>Ajukan Peminjaman</span>
              </Link>
            </Button>
            
            {/* Secondary Actions - Grid on mobile */}
            <div className="grid grid-cols-2 gap-3 sm:contents">
              <Button 
                variant="outline" 
                className="justify-center h-12 sm:h-11 text-sm font-medium border-2 hover:bg-gray-50 transition-all duration-200 bg-white"
                onClick={() => setMarkingDialogOpen(true)}
              >
                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="hidden sm:inline">Buat Marking</span>
                <span className="sm:hidden">Marking</span>
              </Button>

              <Button 
                variant="outline" 
                asChild 
                className="justify-center h-12 sm:h-11 text-sm font-medium border-2 hover:bg-gray-50 transition-all duration-200 bg-white"
              >
                <Link href="/peminjam/panduan" className="flex items-center">
                  <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>Panduan</span>
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Calendar */}
          <SimpleCalendar 
            showEvents={true} 
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            onEventsLoad={handleEventsLoad}
            key={refreshKey}
          />
        </div>

        {/* Event Details */}
        <div className="xl:col-span-2">
          <EventDetails 
            selectedDate={selectedDate}
            events={isRefreshing ? [] : calendarEvents}
            onRefresh={handleRefresh}
            currentUserEmail={session.user.email}
          />
        </div>
      </div>

      {/* Marking Dialog */}
      <MarkingDialog
        session={session}
        open={markingDialogOpen}
        onOpenChange={setMarkingDialogOpen}
        onSuccess={handleMarkingSuccess}
      />
    </div>
  );
} 
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { Clock, Users, MapPin, Package, Calendar, User, Building, Trash2 } from "lucide-react";

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

interface EventDetailDialogProps {
  event: CalendarEvent;
  children: React.ReactNode;
  onRefresh?: () => void;
  currentUserEmail?: string | null;
}

export function EventDetailDialog({ event, children, onRefresh, currentUserEmail }: EventDetailDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatTime = (dateTime: Date | null) => {
    if (!dateTime) return "";
    const date = new Date(dateTime);
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return format(new Date(date), "dd MMMM yyyy", { locale: id });
  };

  const handleDeleteMarking = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/marking/${event.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Marking "${data.markingName}" berhasil dihapus`);
        setShowDeleteConfirm(false);
        setOpen(false);
        onRefresh?.(); // Refresh calendar and events
      } else {
        toast.error(data.message || 'Gagal menghapus marking');
      }
    } catch (error) {
      console.error('Error deleting marking:', error);
      toast.error('Terjadi kesalahan saat menghapus marking');
    } finally {
      setIsDeleting(false);
    }
  };

  // Check if current user can delete this marking
  const canDeleteMarking = event.type === 'marking' && 
    currentUserEmail && 
    event.user?.email === currentUserEmail;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            {event.type === 'marking' ? 'Detail Marking Acara' : 'Detail Peminjaman'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Event Header */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{event.nama_acara}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Tanggal & Waktu */}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <div>
                  <div className="font-medium">
                    {formatDate(event.tanggal_acara_dimulai)}
                    {event.tanggal_acara_berakhir && ` - ${formatDate(event.tanggal_acara_berakhir)}`}
                  </div>
                  <div className="text-sm text-gray-600">
                    {event.type === 'marking' && event.waktu_mulai ? (
                      `${event.waktu_mulai}${event.waktu_berakhir ? ` - ${event.waktu_berakhir}` : ''}`
                    ) : (
                      `${formatTime(event.tanggal_acara_dimulai)} - ${formatTime(event.tanggal_acara_berakhir)}`
                    )}
                  </div>
                </div>
              </div>

              {/* Jumlah Peserta */}
              {event.jumlah_peserta !== undefined && event.jumlah_peserta > 0 && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-500" />
                  <span>{event.jumlah_peserta} peserta</span>
                </div>
              )}

              {/* Lokasi untuk Marking */}
              {event.type === 'marking' && (event.lokasi || event.lokasi_manual) && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>{event.lokasi || event.lokasi_manual}</span>
                </div>
              )}

              {/* Deskripsi */}
              {event.deskripsi_acara && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <div className="font-medium text-sm mb-1">Deskripsi Acara:</div>
                  <p className="text-sm text-gray-700">{event.deskripsi_acara}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Peminjam Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4" />
                {event.type === 'marking' ? 'Informasi Penyelenggara' : 'Informasi Peminjam'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Nama:</span>
                  <span>{event.user?.name || event.user?.email || 'Tidak tersedia'}</span>
                </div>
                
                {event.user?.email && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Email:</span>
                    <span className="text-blue-600">{event.user?.email}</span>
                  </div>
                )}
                
                {event.user?.number_phone && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">No. HP:</span>
                    <span className="text-green-600">{event.user?.number_phone}</span>
                  </div>
                )}
              </div>
              
              {event.ormawa?.nama && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Building className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">Ormawa:</span>
                  <span className="text-blue-600">{event.ormawa.nama}</span>
                </div>
              )}
              
              {(event.user?.pegawai?.unit_pegawai || event.unit_pegawai) && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Building className="w-4 h-4 text-purple-500" />
                  <span className="font-medium">Unit Pegawai:</span>
                  <span className="text-purple-600">{event.user?.pegawai?.unit_pegawai || event.unit_pegawai}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sarana - Only for peminjaman */}
          {event.type !== 'marking' && event.peminjamanSarana && event.peminjamanSarana.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-500" />
                  Sarana yang Dipinjam ({event.peminjamanSarana.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {event.peminjamanSarana.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-blue-50 rounded-md">
                      <span className="font-medium">{item.sarana.nama}</span>
                      <Badge variant="outline">{item.jumlah} unit</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Prasarana - Only for peminjaman */}
          {event.type !== 'marking' && event.peminjamanPrasarana && event.peminjamanPrasarana.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-500" />
                  Prasarana yang Dipinjam ({event.peminjamanPrasarana.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {event.peminjamanPrasarana.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-green-50 rounded-md">
                      <span className="font-medium">{item.prasarana.nama}</span>
                      <Badge variant="outline" className="bg-green-100">Ruangan</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-between gap-2 pt-4 border-t">
            {/* Delete button for marking - only show if user owns the marking */}
            {canDeleteMarking && (
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Hapus Marking
              </Button>
            )}
            
            <div className="flex gap-2 ml-auto">
              <Button onClick={() => setOpen(false)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDeleteMarking}
        title="Hapus Marking Acara"
        description="Apakah Anda yakin ingin menghapus marking acara ini? Data yang sudah dihapus tidak dapat dikembalikan."
        itemName={event.nama_acara}
        isLoading={isDeleting}
      />
    </Dialog>
  );
} 
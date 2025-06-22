'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CalendarIcon, MapPin, Clock, Users, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    role: string;
  };
}

interface MarkingDialogProps {
  session: Session;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface Ormawa {
  id: string;
  nama: string;
}

interface UserData {
  position: string | null;
  pegawai?: {
    unit_pegawai: string | null;
  } | null;
}

export function MarkingDialog({ session, open, onOpenChange, onSuccess }: MarkingDialogProps) {
  const [formData, setFormData] = useState({
    nama_acara: '',
    tanggal_acara_dimulai: undefined as Date | undefined,
    tanggal_acara_berakhir: undefined as Date | undefined,
    waktu_mulai: '',
    waktu_berakhir: '',
    deskripsi: '',
    lokasi: '',
    jumlah_peserta: '',
    ormawaId: 'none',
    unit_pegawai: '',
  });

  const [ormawaList, setOrmawaList] = useState<Ormawa[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    if (open) {
      fetchData();
      fetchUserData();
    }
  }, [open]);

  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      const ormawaRes = await fetch('/api/ormawa');
      
      if (ormawaRes.ok) {
        const ormawaData = await ormawaRes.json();
        setOrmawaList(ormawaData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/users/${session.user.id}`);
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        
        // Set default unit_pegawai if user is pegawai
        if (data.position === 'pegawai' && data.pegawai?.unit_pegawai) {
          setFormData(prev => ({ 
            ...prev, 
            unit_pegawai: data.pegawai.unit_pegawai 
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (field: string, date: Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: date }));
  };

  const resetForm = () => {
    setFormData({
      nama_acara: '',
      tanggal_acara_dimulai: undefined,
      tanggal_acara_berakhir: undefined,
      waktu_mulai: '',
      waktu_berakhir: '',
      deskripsi: '',
      lokasi: '',
      jumlah_peserta: '',
      ormawaId: 'none',
      unit_pegawai: userData?.position === 'pegawai' && userData?.pegawai?.unit_pegawai ? userData.pegawai.unit_pegawai : '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nama_acara || !formData.tanggal_acara_dimulai) {
      toast.error('Nama acara dan tanggal acara harus diisi');
      return;
    }

    setIsLoading(true);

    try {
      const submitData = {
        ...formData,
        jumlah_peserta: formData.jumlah_peserta ? parseInt(formData.jumlah_peserta) : null,
        ormawaId: formData.ormawaId === 'none' ? null : formData.ormawaId,
        // Only send unit_pegawai if user is pegawai
        unit_pegawai: userData?.position === 'pegawai' ? formData.unit_pegawai : null,
        // Remove lokasi_manual since we're using simple lokasi input
        lokasi_manual: null,
      };

      const response = await fetch('/api/marking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Gagal membuat marking');
      }

      toast.success('Marking berhasil dibuat');
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting marking:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal membuat marking');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="pb-4 flex-shrink-0">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Buat Marking Acara
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Isi form di bawah untuk membuat marking acara baru
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            {isLoadingData ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-4 h-4 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  Memuat data...
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8 pb-4">
                {/* Informasi Dasar */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    📋 Informasi Acara
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nama_acara" className="text-sm font-medium text-gray-700">
                        Nama Acara <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="nama_acara"
                        value={formData.nama_acara}
                        onChange={(e) => handleInputChange('nama_acara', e.target.value)}
                        placeholder="Masukkan nama acara"
                        className="w-full"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Tanggal Mulai <span className="text-red-500">*</span>
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal h-10",
                                !formData.tanggal_acara_dimulai && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.tanggal_acara_dimulai ? (
                                format(formData.tanggal_acara_dimulai, "dd MMMM yyyy", { locale: id })
                              ) : (
                                <span>Pilih tanggal</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={formData.tanggal_acara_dimulai}
                              onSelect={(date) => handleDateChange('tanggal_acara_dimulai', date)}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Tanggal Berakhir</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal h-10",
                                !formData.tanggal_acara_berakhir && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.tanggal_acara_berakhir ? (
                                format(formData.tanggal_acara_berakhir, "dd MMMM yyyy", { locale: id })
                              ) : (
                                <span>Pilih tanggal (opsional)</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={formData.tanggal_acara_berakhir}
                              onSelect={(date) => handleDateChange('tanggal_acara_berakhir', date)}
                              disabled={(date) => {
                                if (date < new Date()) return true;
                                if (formData.tanggal_acara_dimulai && date < formData.tanggal_acara_dimulai) return true;
                                return false;
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="waktu_mulai" className="text-sm font-medium text-gray-700">
                          Waktu Mulai
                        </Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="waktu_mulai"
                            type="time"
                            value={formData.waktu_mulai}
                            onChange={(e) => handleInputChange('waktu_mulai', e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="waktu_berakhir" className="text-sm font-medium text-gray-700">
                          Waktu Berakhir
                        </Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="waktu_berakhir"
                            type="time"
                            value={formData.waktu_berakhir}
                            onChange={(e) => handleInputChange('waktu_berakhir', e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="lokasi" className="text-sm font-medium text-gray-700">
                          Lokasi Acara
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="lokasi"
                            value={formData.lokasi}
                            onChange={(e) => handleInputChange('lokasi', e.target.value)}
                            placeholder="Masukkan lokasi acara"
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="jumlah_peserta" className="text-sm font-medium text-gray-700">
                          Jumlah Peserta
                        </Label>
                        <div className="relative">
                          <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="jumlah_peserta"
                            type="number"
                            min="1"
                            value={formData.jumlah_peserta}
                            onChange={(e) => handleInputChange('jumlah_peserta', e.target.value)}
                            placeholder="Masukkan jumlah peserta"
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deskripsi" className="text-sm font-medium text-gray-700">
                        Deskripsi Acara
                      </Label>
                      <Textarea
                        id="deskripsi"
                        value={formData.deskripsi}
                        onChange={(e) => handleInputChange('deskripsi', e.target.value)}
                        placeholder="Masukkan deskripsi acara (opsional)"
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Informasi Organisasi */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    🏢 Informasi Organisasi
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {/* Show Ormawa field only for mahasiswa */}
                    {userData?.position === 'mahasiswa' && (
                      <div className="space-y-2">
                        <Label htmlFor="ormawa" className="text-sm font-medium text-gray-700">
                          Organisasi Mahasiswa
                        </Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Select
                            value={formData.ormawaId}
                            onValueChange={(value) => handleInputChange('ormawaId', value)}
                          >
                            <SelectTrigger className="pl-10">
                              <SelectValue placeholder="Pilih organisasi" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Tidak ada organisasi</SelectItem>
                              {ormawaList.map((ormawa) => (
                                <SelectItem key={ormawa.id} value={ormawa.id}>
                                  {ormawa.nama}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* Show Unit field only for pegawai */}
                    {userData?.position === 'pegawai' && (
                      <div className="space-y-2">
                        <Label htmlFor="unit_pegawai" className="text-sm font-medium text-gray-700">
                          Unit Pegawai
                        </Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="unit_pegawai"
                            value={formData.unit_pegawai}
                            onChange={(e) => handleInputChange('unit_pegawai', e.target.value)}
                            placeholder="Masukkan unit pegawai"
                            className="pl-10"
                          />
                        </div>
                      </div>
                    )}

                    {/* Show message if position is not determined yet */}
                    {!userData?.position && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-700">
                          Memuat informasi profil...
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            )}
          </ScrollArea>
        </div>

        <DialogFooter className="pt-4 gap-2 border-t flex-shrink-0 bg-white">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
            disabled={isLoading}
            className="min-w-[100px]"
          >
            Batal
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || isLoadingData}
            className="min-w-[120px] bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
                Menyimpan...
              </div>
            ) : (
              'Simpan Marking'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
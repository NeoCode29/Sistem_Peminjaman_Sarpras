'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CalendarIcon, Plus, Minus, MapPin } from 'lucide-react';
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

interface MarkingFormProps {
  session: Session;
}

interface Sarana {
  id: string;
  nama: string;
  stok: number;
  sisa: number;
  satuanSatuan: {
    singkatan: string;
  };
}

interface Prasarana {
  id: string;
  nama: string;
  lokasi?: string;
  kapasitas?: number;
}

interface SelectedSarana {
  id: string;
  nama: string;
  jumlah: number;
  maxStok: number;
  satuan: string;
}

interface SelectedPrasarana {
  id: string;
  nama: string;
  lokasi?: string;
}

export function MarkingForm({ session }: MarkingFormProps) {
  const [formData, setFormData] = useState({
    nama_acara: '',
    tanggal_acara_dimulai: undefined as Date | undefined,
    tanggal_acara_berakhir: undefined as Date | undefined,
    deskripsi: '',
    lokasi: '',
    jumlah_peserta: '',
  });

  const [saranList, setSaranaList] = useState<Sarana[]>([]);
  const [prasaranaList, setPrasaranaList] = useState<Prasarana[]>([]);
  const [selectedSarana, setSelectedSarana] = useState<SelectedSarana[]>([]);
  const [selectedPrasarana, setSelectedPrasarana] = useState<SelectedPrasarana[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSaranaPrasarana();
  }, []);

  const fetchSaranaPrasarana = async () => {
    try {
      const [saranaRes, prasaranaRes] = await Promise.all([
        fetch('/api/sarana'),
        fetch('/api/prasarana')
      ]);
      
      if (saranaRes.ok) {
        const saranaData = await saranaRes.json();
        setSaranaList(saranaData);
      }
      
      if (prasaranaRes.ok) {
        const prasaranaData = await prasaranaRes.json();
        setPrasaranaList(prasaranaData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data sarana dan prasarana');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (field: string, date: Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: date }));
  };

  const addSarana = (sarana: Sarana) => {
    if (selectedSarana.find(s => s.id === sarana.id)) {
      toast.error('Sarana sudah dipilih');
      return;
    }

    const newSarana: SelectedSarana = {
      id: sarana.id,
      nama: sarana.nama,
      jumlah: 1,
      maxStok: sarana.sisa,
      satuan: sarana.satuanSatuan.singkatan
    };

    setSelectedSarana(prev => [...prev, newSarana]);
  };

  const removeSarana = (id: string) => {
    setSelectedSarana(prev => prev.filter(s => s.id !== id));
  };

  const updateSaranaJumlah = (id: string, jumlah: number) => {
    setSelectedSarana(prev => 
      prev.map(s => s.id === id ? { ...s, jumlah: Math.max(1, Math.min(jumlah, s.maxStok)) } : s)
    );
  };

  const addPrasarana = (prasarana: Prasarana) => {
    if (selectedPrasarana.find(p => p.id === prasarana.id)) {
      toast.error('Prasarana sudah dipilih');
      return;
    }

    const newPrasarana: SelectedPrasarana = {
      id: prasarana.id,
      nama: prasarana.nama,
      lokasi: prasarana.lokasi
    };

    setSelectedPrasarana(prev => [...prev, newPrasarana]);
  };

  const removePrasarana = (id: string) => {
    setSelectedPrasarana(prev => prev.filter(p => p.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nama_acara || !formData.tanggal_acara_dimulai) {
      toast.error('Nama acara dan tanggal mulai wajib diisi');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/marking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          jumlah_peserta: formData.jumlah_peserta ? parseInt(formData.jumlah_peserta) : null,
          sarana_direncanakan: selectedSarana.map(s => ({
            saranaId: s.id,
            jumlah_direncanakan: s.jumlah
          })),
          prasarana_direncanakan: selectedPrasarana.map(p => ({
            prasaranaId: p.id
          }))
        }),
      });

      if (response.ok) {
        toast.success('Marking berhasil dibuat');
        // Reset form
        setFormData({
          nama_acara: '',
          tanggal_acara_dimulai: undefined,
          tanggal_acara_berakhir: undefined,
          deskripsi: '',
          lokasi: '',
          jumlah_peserta: '',
        });
        setSelectedSarana([]);
        setSelectedPrasarana([]);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Gagal membuat marking');
      }
    } catch (error) {
      console.error('Error creating marking:', error);
      toast.error('Terjadi kesalahan saat membuat marking');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Info Acara */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Informasi Acara
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="nama_acara">Nama Acara *</Label>
            <Input
              id="nama_acara"
              value={formData.nama_acara}
              onChange={(e) => handleInputChange('nama_acara', e.target.value)}
              placeholder="Masukkan nama acara"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Tanggal Mulai *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.tanggal_acara_dimulai && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.tanggal_acara_dimulai ? (
                      format(formData.tanggal_acara_dimulai, "PPP", { locale: id })
                    ) : (
                      <span>Pilih tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.tanggal_acara_dimulai}
                    onSelect={(date) => handleDateChange('tanggal_acara_dimulai', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Tanggal Selesai</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.tanggal_acara_berakhir && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.tanggal_acara_berakhir ? (
                      format(formData.tanggal_acara_berakhir, "PPP", { locale: id })
                    ) : (
                      <span>Pilih tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.tanggal_acara_berakhir}
                    onSelect={(date) => handleDateChange('tanggal_acara_berakhir', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lokasi">Lokasi</Label>
              <Input
                id="lokasi"
                value={formData.lokasi}
                onChange={(e) => handleInputChange('lokasi', e.target.value)}
                placeholder="Lokasi acara"
              />
            </div>

            <div>
              <Label htmlFor="jumlah_peserta">Jumlah Peserta</Label>
              <Input
                id="jumlah_peserta"
                type="number"
                value={formData.jumlah_peserta}
                onChange={(e) => handleInputChange('jumlah_peserta', e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea
              id="deskripsi"
              value={formData.deskripsi}
              onChange={(e) => handleInputChange('deskripsi', e.target.value)}
              placeholder="Deskripsi acara (opsional)"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pilih Sarana */}
      <Card>
        <CardHeader>
          <CardTitle>Sarana yang Direncanakan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Pilih Sarana</Label>
            <div className="max-h-40 overflow-y-auto border rounded-md p-2">
              {saranList.map((sarana) => (
                <div
                  key={sarana.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                >
                  <div>
                    <span className="font-medium">{sarana.nama}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      (Tersedia: {sarana.sisa} {sarana.satuanSatuan.singkatan})
                    </span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => addSarana(sarana)}
                    disabled={sarana.sisa === 0 || !!selectedSarana.find(s => s.id === sarana.id)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {selectedSarana.length > 0 && (
            <div>
              <Label>Sarana Terpilih</Label>
              <div className="space-y-2">
                {selectedSarana.map((sarana) => (
                  <div key={sarana.id} className="flex items-center gap-2 p-2 border rounded">
                    <span className="flex-1">{sarana.nama}</span>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => updateSaranaJumlah(sarana.id, sarana.jumlah - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-16 text-center">
                        {sarana.jumlah} {sarana.satuan}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => updateSaranaJumlah(sarana.id, sarana.jumlah + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => removeSarana(sarana.id)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pilih Prasarana */}
      <Card>
        <CardHeader>
          <CardTitle>Prasarana yang Direncanakan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Pilih Prasarana</Label>
            <div className="max-h-40 overflow-y-auto border rounded-md p-2">
              {prasaranaList.map((prasarana) => (
                <div
                  key={prasarana.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                >
                  <div>
                    <span className="font-medium">{prasarana.nama}</span>
                    {prasarana.lokasi && (
                      <span className="text-sm text-gray-500 ml-2">
                        - {prasarana.lokasi}
                      </span>
                    )}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => addPrasarana(prasarana)}
                    disabled={!!selectedPrasarana.find(p => p.id === prasarana.id)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {selectedPrasarana.length > 0 && (
            <div>
              <Label>Prasarana Terpilih</Label>
              <div className="space-y-2">
                {selectedPrasarana.map((prasarana) => (
                  <div key={prasarana.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <span className="font-medium">{prasarana.nama}</span>
                      {prasarana.lokasi && (
                        <span className="text-sm text-gray-500 ml-2">
                          - {prasarana.lokasi}
                        </span>
                      )}
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => removePrasarana(prasarana.id)}
                    >
                      Hapus
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} className="min-w-32">
          {isLoading ? 'Menyimpan...' : 'Buat Marking'}
        </Button>
      </div>
    </form>
  );
} 
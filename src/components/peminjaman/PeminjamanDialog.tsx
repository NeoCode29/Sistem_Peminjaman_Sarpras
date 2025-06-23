"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { PeminjamanForm } from "./PeminjamanForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { UserRole } from "@prisma/client";
import { usePeminjamanPeminjam } from "@/hooks/usePeminjamanPeminjam";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarWithTime } from "@/components/ui/calendar-with-time";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { getAvailableSarprasOptions } from "@/service/peminjamanService";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { submitPengajuanAction } from "@/actions/peminjamanActions";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/hooks/useUser";

interface PeminjamanDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    role: UserRole;
  };
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
}

interface FormData {
  ormawa: string;
  unit_pegawai: string;
  nama_acara: string;
  tanggal_acara_dimulai: Date;
  waktu_acara_dimulai: string;
  tanggal_acara_berakhir: Date;
  waktu_acara_berakhir: string;
  jumlah_peserta: number;
  deskripsi_acara: string;
  surat_pengajuan: File | null;
  sarpras_peminjaman: "SARANA" | "PRASARANA" | "BOTH";
  selectedSarana: Array<{ id: string; nama: string; jumlah: number }>;
  selectedPrasarana: { id: string; nama: string } | null;
}

interface SarprasOptions {
  prasarana: Array<{
    id: string;
    nama: string;
    lokasi: string | null;
    kapasitas: number | null;
    status: string;
  }>;
  sarana: Array<{
    id: string;
    nama: string;
    jenis: string;
    sisa: number;
    status: string;
    satuanSatuan: {
      nama: string;
      singkatan: string;
    };
  }>;
}

export default function PeminjamanDialog({ open, setOpen, user, onSubmit, initialData }: PeminjamanDialogProps) {
  const { toast } = useToast();
  const { userData, isLoadingUser, userError } = usePeminjamanPeminjam(user?.id || '');
  const [currentStep, setCurrentStep] = useState(1);
  const [showSaranaDialog, setShowSaranaDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sarprasOptions, setSarprasOptions] = useState<SarprasOptions>({
    prasarana: [],
    sarana: []
  });

  const [formData, setFormData] = useState<FormData>({
    ormawa: "",
    unit_pegawai: "",
    nama_acara: "",
    tanggal_acara_dimulai: new Date(),
    waktu_acara_dimulai: "",
    tanggal_acara_berakhir: new Date(),
    waktu_acara_berakhir: "",
    jumlah_peserta: 0,
    deskripsi_acara: "",
    surat_pengajuan: null,
    sarpras_peminjaman: "SARANA",
    selectedSarana: [],
    selectedPrasarana: null,
  });
  const [selectedSaranaId, setSelectedSaranaId] = useState<string>("");

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      ormawa: "",
      unit_pegawai: "",
      nama_acara: "",
      tanggal_acara_dimulai: new Date(),
      waktu_acara_dimulai: "",
      tanggal_acara_berakhir: new Date(),
      waktu_acara_berakhir: "",
      jumlah_peserta: 0,
      deskripsi_acara: "",
      surat_pengajuan: null,
      sarpras_peminjaman: "SARANA",
      selectedSarana: [],
      selectedPrasarana: null,
    });
    setSelectedSaranaId("");
    setCurrentStep(1);
  };

  // Populate form with initial data when editing
  useEffect(() => {
    if (initialData) {
      // Parse dates
      const startDate = new Date(initialData.tanggal_acara_dimulai);
      const endDate = new Date(initialData.tanggal_acara_berakhir);
      
      setFormData(prev => ({
        ...prev,
        ormawa: initialData.ormawa?.id || "",
        unit_pegawai: initialData.unit_pegawai || "",
        nama_acara: initialData.nama_acara,
        tanggal_acara_dimulai: startDate,
        waktu_acara_dimulai: format(startDate, "HH:mm"),
        tanggal_acara_berakhir: endDate,
        waktu_acara_berakhir: format(endDate, "HH:mm"),
        jumlah_peserta: initialData.jumlah_peserta,
        deskripsi_acara: initialData.deskripsi_acara,
        sarpras_peminjaman: initialData.sarpras_peminjaman,
        selectedSarana: initialData.peminjamanSarana.map((item: any) => ({
          id: item.sarana.id,
          nama: item.sarana.nama,
          jumlah: item.jumlah
        })),
        selectedPrasarana: initialData.peminjamanPrasarana.length > 0 ? {
          id: initialData.peminjamanPrasarana[0].prasarana.id,
          nama: initialData.peminjamanPrasarana[0].prasarana.nama
        } : null,
      }));

      // Set ormawa in userData if it exists
      if (initialData.ormawa) {
        handleUserDataChange({
          ormawa: initialData.ormawa.id,
          unit_pegawai: initialData.unit_pegawai
        });
      }
    }
  }, [initialData]);

  // Update pickup and return dates when event dates change
  useEffect(() => {
    if (formData.tanggal_acara_dimulai && formData.tanggal_acara_berakhir) {
      const pickupDate = new Date(formData.tanggal_acara_dimulai);
      pickupDate.setDate(pickupDate.getDate() - 1);
      
      const returnDate = new Date(formData.tanggal_acara_berakhir);
      returnDate.setDate(returnDate.getDate() + 1);

      setFormData(prev => ({
        ...prev,
        tanggal_pengambilan: pickupDate,
        tanggal_pengembalian: returnDate
      }));
    }
  }, [formData.tanggal_acara_dimulai, formData.tanggal_acara_berakhir]);

  // Fetch available sarpras options when dialog opens
  useEffect(() => {
    if (open) {
      const fetchSarprasOptions = async () => {
        try {
          const result = await getAvailableSarprasOptions();
          if (result.success && result.data) {
            setSarprasOptions(result.data);
          } else {
            toast.error("Gagal memuat data sarana dan prasarana");
          }
        } catch (error) {
          console.error("Error fetching sarpras options:", error);
          toast.error("Gagal memuat data sarana dan prasarana");
        }
      };

      fetchSarprasOptions();
      
      // Reset form when opening for new peminjaman (not editing)
      if (!initialData) {
        resetForm();
      }
    }
  }, [open, toast, initialData]);

  const validateStep1 = () => {
    // Validasi untuk mahasiswa (harus memilih ormawa)
    if (userData?.mahasiswa) {
      if (!formData.ormawa) {
        toast.error("Mohon pilih organisasi mahasiswa");
        return false;
      }
    }

    // Validasi untuk pegawai (harus mengisi unit)
    if (userData?.pegawai) {
      if (!formData.unit_pegawai) {
        toast.error("Mohon isi unit pegawai");
        return false;
      }
    }

    // Jika bukan keduanya, tidak valid
    if (!userData?.mahasiswa && !userData?.pegawai) {
      toast.error("Data pengguna tidak valid");
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    // Validasi nama acara
    if (!formData.nama_acara.trim()) {
      toast.error("Nama acara harus diisi");
      return false;
    }

    // Validasi deskripsi acara
    if (!formData.deskripsi_acara.trim()) {
      toast.error("Deskripsi acara harus diisi");
      return false;
    }

    // Validasi jumlah peserta
    if (formData.jumlah_peserta <= 0) {
      toast.error("Jumlah peserta harus lebih dari 0");
      return false;
    }

    // Validasi tanggal dan waktu
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Membuat objek Date dengan tanggal dan waktu yang digabungkan
    const acaraDimulai = new Date(formData.tanggal_acara_dimulai);
    const waktuDimulai = formData.waktu_acara_dimulai.split(":");
    acaraDimulai.setHours(parseInt(waktuDimulai[0]), parseInt(waktuDimulai[1]));

    const acaraBerakhir = new Date(formData.tanggal_acara_berakhir);
    const waktuBerakhir = formData.waktu_acara_berakhir.split(":");
    acaraBerakhir.setHours(parseInt(waktuBerakhir[0]), parseInt(waktuBerakhir[1]));

    // 1. Validasi tanggal acara dimulai tidak boleh di masa lalu
    if (acaraDimulai <= now) {
      toast.error("Tanggal dan waktu acara dimulai harus di masa depan");
      return false;
    }

    // 2. Validasi waktu acara berakhir harus setelah acara dimulai
    if (acaraBerakhir <= acaraDimulai) {
      // Jika di hari yang sama
      if (
        acaraDimulai.getDate() === acaraBerakhir.getDate() &&
        acaraDimulai.getMonth() === acaraBerakhir.getMonth() &&
        acaraDimulai.getFullYear() === acaraBerakhir.getFullYear()
      ) {
        toast.error("Waktu acara berakhir harus setelah waktu acara dimulai di hari yang sama");
      } else {
        toast.error("Tanggal dan waktu acara berakhir harus setelah waktu acara dimulai");
      }
      return false;
    }

    // Validasi surat pengajuan
    if (!formData.surat_pengajuan) {
      toast.error("Surat pengajuan harus diunggah");
      return false;
    }

    // Validasi format surat pengajuan
    if (formData.surat_pengajuan && !formData.surat_pengajuan.type.includes('pdf')) {
      toast.error("Surat pengajuan harus berformat PDF");
      return false;
    }

    return true;
  };

  const validateStep3 = () => {
    switch (formData.sarpras_peminjaman) {
      case "SARANA":
        if (formData.selectedSarana.length === 0) {
          toast.error("Pilih minimal satu sarana");
          return false;
        }
        break;
      case "PRASARANA":
        if (!formData.selectedPrasarana) {
          toast.error("Pilih prasarana");
          return false;
        }
        break;
      case "BOTH":
        if (formData.selectedSarana.length === 0 && !formData.selectedPrasarana) {
          toast.error("Pilih minimal satu sarana dan satu prasarana");
          return false;
        }
        break;
    }

    // Validasi jumlah sarana
    for (const sarana of formData.selectedSarana) {
      const saranaDetail = sarprasOptions.sarana.find(s => s.id === sarana.id);
      if (saranaDetail && sarana.jumlah > saranaDetail.sisa) {
        toast.error(`Jumlah ${sarana.nama} melebihi stok yang tersedia`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    try {
      if (!validateStep3()) return;

      


      // Combine date and time for proper datetime
      const startDateTime = new Date(formData.tanggal_acara_dimulai);
      const [startHour, startMinute] = formData.waktu_acara_dimulai.split(':');
      startDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);

      const endDateTime = new Date(formData.tanggal_acara_berakhir);
      const [endHour, endMinute] = formData.waktu_acara_berakhir.split(':');
      endDateTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

      const submitData = new FormData();
      submitData.append('userId', user.id);
      submitData.append('nama_acara', formData.nama_acara);
      submitData.append('tanggal_acara_dimulai', startDateTime.toISOString());
      submitData.append('tanggal_acara_berakhir', endDateTime.toISOString());
      submitData.append('jumlah_peserta', formData.jumlah_peserta.toString());
      submitData.append('deskripsi_acara', formData.deskripsi_acara);
      submitData.append('ormawa', formData.ormawa);
      submitData.append('unit_pegawai', formData.unit_pegawai);
      submitData.append('sarpras_peminjaman', formData.sarpras_peminjaman);
      submitData.append('prasaranaIds', JSON.stringify(formData.selectedPrasarana ? [formData.selectedPrasarana.id] : []));
      submitData.append('saranaItems', JSON.stringify(formData.selectedSarana.map(item => ({
        saranaId: item.id,
        jumlah: item.jumlah
      }))));

      // Handle file upload
      if (!formData.surat_pengajuan) {
        toast("Surat pengajuan harus diunggah");
        return;
      }

      // Append file directly to FormData
      const file = formData.surat_pengajuan;
      submitData.append('surat_pengajuan', file);
      submitData.append('surat_pengajuan_name', file.name);



      await onSubmit(submitData);
      resetForm(); // Reset form after successful submit
      setOpen(false);
      toast("Pengajuan peminjaman berhasil dikirim");
    } catch (error) {
      toast("Terjadi kesalahan saat mengirim pengajuan");
    }
  };

  const handleUserDataChange = (data: { ormawa?: string; unit_pegawai?: string }) => {
    setFormData(prev => ({
      ...prev,
      ...data
    }));
  };

  const handleAddSarana = (sarana: SarprasOptions['sarana'][0]) => {
    setFormData(prev => ({
      ...prev,
      selectedSarana: [...prev.selectedSarana, { id: sarana.id, nama: sarana.nama, jumlah: 1 }]
    }));
  };

  const handleRemoveSarana = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedSarana: prev.selectedSarana.filter(item => item.id !== id)
    }));
  };

  const handleUpdateSaranaJumlah = (id: string, jumlah: number) => {
    setFormData(prev => ({
      ...prev,
      selectedSarana: prev.selectedSarana.map(item =>
        item.id === id ? { ...item, jumlah } : item
      )
    }));
  };

  const handleSelectPrasarana = (prasarana: SarprasOptions['prasarana'][0]) => {
    setFormData(prev => ({
      ...prev,
      selectedPrasarana: { id: prasarana.id, nama: prasarana.nama }
    }));
  };

  const handleAddSaranaClick = () => {
    if (selectedSaranaId) {
      const sarana = sarprasOptions.sarana.find(s => s.id === selectedSaranaId);
      if (sarana) {
        // Check if sarana is already selected
        const isAlreadySelected = formData.selectedSarana.some(item => item.id === sarana.id);
        if (!isAlreadySelected) {
          handleAddSarana(sarana);
          setSelectedSaranaId(""); // Reset selection after adding
        } else {
          toast("Sarana sudah dipilih");
        }
      }
    } else {
      toast("Pilih sarana terlebih dahulu");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => {
        const newData = {
          ...prev,
          surat_pengajuan: file
        };
        return newData;
      });
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <PeminjamanForm
            userData={userData}
            isLoading={isLoadingUser}
            error={userError}
            onDataChange={handleUserDataChange}
          />
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Data Acara</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Acara</Label>
                <Input
                  required
                  value={formData.nama_acara}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, nama_acara: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Deskripsi Acara</Label>
                <Textarea
                  required
                  value={formData.deskripsi_acara}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, deskripsi_acara: e.target.value }))
                  }
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tanggal Acara Dimulai</Label>
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
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.tanggal_acara_dimulai}
                      onSelect={(date) =>
                        date && setFormData(prev => ({ ...prev, tanggal_acara_dimulai: date }))
                      }
                      initialFocus
                      locale={id}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Waktu Acara Dimulai</Label>
                <Input
                  type="time"
                  value={formData.waktu_acara_dimulai}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, waktu_acara_dimulai: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Tanggal Acara Selesai</Label>
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
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.tanggal_acara_berakhir}
                      onSelect={(date) =>
                        date && setFormData(prev => ({ ...prev, tanggal_acara_berakhir: date }))
                      }
                      initialFocus
                      locale={id}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Waktu Acara Selesai</Label>
                <Input
                  type="time"
                  value={formData.waktu_acara_berakhir}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, waktu_acara_berakhir: e.target.value }))
                  }
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Jumlah Peserta</Label>
                <Input
                  type="number"
                  required
                  value={formData.jumlah_peserta}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      jumlah_peserta: parseInt(e.target.value),
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Jenis Peminjaman</Label>
                <Select
                  value={formData.sarpras_peminjaman}
                  onValueChange={(value: "SARANA" | "PRASARANA" | "BOTH") =>
                    setFormData(prev => ({ ...prev, sarpras_peminjaman: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis peminjaman" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SARANA">Sarana</SelectItem>
                    <SelectItem value="PRASARANA">Prasarana</SelectItem>
                    <SelectItem value="BOTH">Keduanya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Surat Pengajuan (PDF)</Label>
              <Input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                required
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Pemilihan Sarana dan Prasarana</h3>
            
            <div className="space-y-6">
              {/* Sarana Section */}
              {(formData.sarpras_peminjaman === "SARANA" || formData.sarpras_peminjaman === "BOTH") && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Pilih Sarana</Label>
                    <div className="flex items-center gap-2">
                      <Select
                        value={selectedSaranaId}
                        onValueChange={setSelectedSaranaId}
                      >
                        <SelectTrigger className="w-[400px]">
                          <SelectValue placeholder="Pilih sarana untuk ditambahkan" />
                        </SelectTrigger>
                        <SelectContent>
                          {sarprasOptions.sarana
                            .filter(sarana => !formData.selectedSarana.some(selected => selected.id === sarana.id))
                            .map((sarana) => (
                            <SelectItem key={`sarana-option-${sarana.id}`} value={sarana.id}>
                              {sarana.nama} (Stok: {sarana.sisa} {sarana.satuanSatuan.singkatan})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={handleAddSaranaClick}
                        disabled={!selectedSaranaId}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {formData.selectedSarana.length > 0 && (
                    <div className="space-y-2">
                      <Label>Sarana yang Dipilih</Label>
                      <div className="grid gap-2">
                        {formData.selectedSarana.map((item, index) => {
                          const saranaDetail = sarprasOptions.sarana.find(s => s.id === item.id);
                          return (
                            <div key={`selected-sarana-${item.id}-${index}`} className="flex items-center justify-between bg-muted p-3 rounded-md">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{item.nama}</span>
                                <Badge variant="secondary" className="text-xs">
                                  Stok: {saranaDetail?.sisa} {saranaDetail?.satuanSatuan.singkatan}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  value={item.jumlah}
                                  onChange={(e) => handleUpdateSaranaJumlah(item.id, parseInt(e.target.value))}
                                  min={1}
                                  max={saranaDetail?.sisa || 1}
                                  className="w-16 h-8"
                                />
                                <span className="text-xs text-muted-foreground">{saranaDetail?.satuanSatuan.singkatan}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => handleRemoveSarana(item.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Prasarana Section */}
              {(formData.sarpras_peminjaman === "PRASARANA" || formData.sarpras_peminjaman === "BOTH") && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Pilih Prasarana</Label>
                    <Select
                      value={formData.selectedPrasarana?.id}
                      onValueChange={(value) => {
                        const prasarana = sarprasOptions.prasarana.find(p => p.id === value);
                        if (prasarana) handleSelectPrasarana(prasarana);
                      }}
                    >
                      <SelectTrigger className="w-[400px]">
                        <SelectValue placeholder="Pilih prasarana" />
                      </SelectTrigger>
                      <SelectContent>
                        {sarprasOptions.prasarana.map(prasarana => (
                          <SelectItem key={`prasarana-option-${prasarana.id}`} value={prasarana.id}>
                            {prasarana.nama} {prasarana.kapasitas && `(Kapasitas: ${prasarana.kapasitas} orang)`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.selectedPrasarana && (
                    <div className="text-sm text-muted-foreground">
                      Prasarana terpilih: <span className="font-medium text-foreground">{formData.selectedPrasarana.nama}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Buat Peminjaman</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <form onSubmit={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Buat Peminjaman Baru</DialogTitle>
            <DialogDescription>
              {currentStep === 1 && "Lengkapi data diri Anda"}
              {currentStep === 2 && "Masukkan informasi acara"}
              {currentStep === 3 && "Pilih sarana dan prasarana yang akan dipinjam"}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[calc(100vh-300px)] w-full rounded-md">
            <div className="space-y-6 py-4 pr-4">
              {renderStepContent()}
            </div>
            <ScrollBar />
          </ScrollArea>
          <div className="flex justify-between pt-6">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
              >
                Sebelumnya
              </Button>
            )}
            {currentStep < 3 ? (
              <Button
                type="button"
                className={cn(currentStep > 1 && "ml-auto")}
                onClick={handleNext}
              >
                Selanjutnya
              </Button>
            ) : (
              <Button
                type="button"
                className="ml-auto"
                disabled={isLoading}
                onClick={handleSubmit}
              >
                {isLoading ? "Menyimpan..." : "Simpan"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
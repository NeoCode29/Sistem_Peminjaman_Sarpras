'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  MapPin, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Download,
  ExternalLink,
  Users,
  Calendar,
  Package,
  Phone,
  MessageCircle
} from 'lucide-react';
import { getSettings, getTemplateSettings } from '@/actions/settingActions';

export function PanduanContent() {
  const [templates, setTemplates] = useState<any>({});
  const [settings, setSettings] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [templatesResponse, settingsResponse] = await Promise.all([
        getTemplateSettings(),
        getSettings()
      ]);
      
      if (templatesResponse.success) {
        setTemplates(templatesResponse.data || {});
      }
      
      if (settingsResponse.success) {
        setSettings(settingsResponse.data || {});
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stepsPeminjaman = [
    {
      step: 1,
      title: "Persiapan Dokumen",
      description: "Siapkan surat pengajuan dan form yang sudah bertanda tangan",
      status: "required",
      details: [
        "Download template surat pengajuan",
        "Isi informasi acara dengan lengkap",
        "Pastikan form sudah bertanda tangan pihak yang berwenang",
        "Convert ke format PDF untuk upload"
      ]
    },
    {
      step: 2,
      title: "Membuat Pengajuan",
      description: "Tekan membuat pengajuan dan isi form pengajuan dengan lengkap",
      status: "required",
      details: [
        "Akses menu 'Buat Pengajuan' di dashboard",
        "Isi semua field yang diperlukan dengan lengkap",
        "Upload dokumen surat pengajuan yang sudah ditandatangani",
        "Pilih sarana dan prasarana yang dibutuhkan",
        "Submit pengajuan untuk review admin"
      ]
    },
    {
      step: 3,
      title: "Menunggu Validasi Admin",
      description: "Tunggu admin memvalidasi pengajuan Anda",
      status: "waiting",
      details: [
        "Admin akan mereview pengajuan dalam 1-3 hari kerja",
        "Pantau status pengajuan di dashboard",
        "Jika tidak ada validasi, hubungi admin melalui kontak yang tersedia"
      ]
    },
    {
      step: 4,
      title: "Pengambilan Barang",
      description: "Jika admin menerima pengajuan, lakukan pengambilan barang",
      status: "action",
      details: [
        "Buat janji temu dengan admin untuk pengambilan",
        "Datang sesuai jadwal yang disepakati",
        "Checklist barang yang diambil bersama admin",
        "Simpan catatan checklist untuk pengembalian",
        "Barang siap digunakan untuk acara"
      ]
    },
    {
      step: 5,
      title: "Jika Pengajuan Ditolak",
      description: "Peminjam dapat mengedit ulang pengajuan yang ditolak",
      status: "optional",
      details: [
        "Baca alasan penolakan dari admin",
        "Edit pengajuan sesuai catatan admin",
        "Perbaiki dokumen atau informasi yang kurang",
        "Submit ulang pengajuan yang sudah diperbaiki"
      ]
    },
    {
      step: 6,
      title: "Pengembalian Barang",
      description: "Setelah acara selesai, lakukan pengembalian barang",
      status: "action",
      details: [
        "Buat janji temu dengan admin untuk pengembalian",
        "Pastikan semua barang dalam kondisi baik",
        "Checklist barang yang dikembalikan bersama admin",
        "Simpan catatan pengembalian",
        "Admin akan mengonfirmasi pengembalian selesai"
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'required': return 'bg-red-100 text-red-800';
      case 'optional': return 'bg-blue-100 text-blue-800';
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'action': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'required': return <AlertCircle className="w-4 h-4" />;
      case 'optional': return <MapPin className="w-4 h-4" />;
      case 'waiting': return <Clock className="w-4 h-4" />;
      case 'action': return <CheckCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <Tabs defaultValue="peminjaman" className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
        <TabsTrigger value="peminjaman" className="text-xs sm:text-sm px-2 sm:px-4 py-2">
          <span className="hidden sm:inline">Langkah Peminjaman</span>
          <span className="sm:hidden">Peminjaman</span>
        </TabsTrigger>
        <TabsTrigger value="marking" className="text-xs sm:text-sm px-2 sm:px-4 py-2">
          <span className="hidden sm:inline">Tentang Marking</span>
          <span className="sm:hidden">Marking</span>
        </TabsTrigger>
        <TabsTrigger value="templates" className="text-xs sm:text-sm px-2 sm:px-4 py-2">
          <span className="hidden sm:inline">Template & Dokumen</span>
          <span className="sm:hidden">Template</span>
        </TabsTrigger>
        <TabsTrigger value="kontak" className="text-xs sm:text-sm px-2 sm:px-4 py-2">
          <span className="hidden sm:inline">Informasi Kontak</span>
          <span className="sm:hidden">Kontak</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="peminjaman" className="space-y-4 sm:space-y-6">
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              Alur Proses Peminjaman Sarana Prasarana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
              Berikut adalah langkah-langkah untuk melakukan peminjaman sarana dan prasarana:
            </p>
            <div className="space-y-4 sm:space-y-6">
              {stepsPeminjaman.map((step, index) => (
                <div key={step.step} className="relative">
                  {index < stepsPeminjaman.length - 1 && (
                    <div className="absolute left-4 sm:left-6 top-10 sm:top-12 w-0.5 h-12 sm:h-16 bg-gray-200" />
                  )}
                  
                  <div className="flex gap-3 sm:gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">
                        {step.step}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h3 className="text-base sm:text-lg font-semibold">{step.title}</h3>
                        <Badge className={`${getStatusColor(step.status)} w-fit text-xs`}>
                          {getStatusIcon(step.status)}
                          <span className="ml-1">
                            {step.status === 'required' && 'Wajib'}
                            {step.status === 'optional' && 'Opsional'}
                            {step.status === 'waiting' && 'Menunggu'}
                            {step.status === 'action' && 'Tindakan'}
                          </span>
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-3 text-sm sm:text-base">{step.description}</p>
                      
                      <ul className="space-y-1 sm:space-y-2">
                        {step.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="leading-relaxed">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="marking" className="space-y-4 sm:space-y-6">
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
              Apa itu Marking?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 text-sm sm:text-base">
              Marking adalah fitur untuk memberitahu rencana acara dan kebutuhan sarana prasarana Anda. 
              Ini membantu koordinasi dan perencanaan yang lebih baik di lingkungan kampus.
            </p>
            
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              <div>
                <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  Kegunaan Marking
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm">
                  <li className="flex gap-2">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Memberitahu jadwal acara yang direncanakan</span>
                  </li>
                  <li className="flex gap-2">
                    <Package className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Menginformasikan kebutuhan sarana prasarana</span>
                  </li>
                  <li className="flex gap-2">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Membantu koordinasi antar pengguna</span>
                  </li>
                  <li className="flex gap-2">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Menghindari bentrok jadwal</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-amber-700 mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  Penting Diketahui
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm">
                  <li className="flex gap-2">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
                    <span>Marking bersifat informatif, bukan pemesanan</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
                    <span>Tidak menjamin ketersediaan sarpras</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
                    <span>Tetap harus mengajukan peminjaman resmi</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
                    <span>Bisa diubah atau dibatalkan kapan saja</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="templates" className="space-y-4 sm:space-y-6">
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              Template & Dokumen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {templates.template_form_peminjaman && (
                  <div className="border rounded-lg p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3">
                        <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 flex-shrink-0 mt-1 sm:mt-0" />
                        <div className="min-w-0">
                          <h4 className="font-medium text-sm sm:text-base">Template Form Peminjaman</h4>
                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                            Format form peminjaman yang harus diisi saat mengajukan peminjaman
                          </p>
                        </div>
                      </div>
                      <Button asChild variant="outline" size="sm" className="self-start sm:self-auto shrink-0">
                        <a 
                          href={templates.template_form_peminjaman} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          <span className="text-xs sm:text-sm">Lihat Template</span>
                        </a>
                      </Button>
                    </div>
                  </div>
                )}

                {templates.template_surat_pengajuan && (
                  <div className="border rounded-lg p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3">
                        <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 flex-shrink-0 mt-1 sm:mt-0" />
                        <div className="min-w-0">
                          <h4 className="font-medium text-sm sm:text-base">Template Surat Pengajuan</h4>
                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                            Template surat resmi yang harus dilampirkan saat peminjaman
                          </p>
                        </div>
                      </div>
                      <Button asChild variant="outline" size="sm" className="self-start sm:self-auto shrink-0">
                        <a 
                          href={templates.template_surat_pengajuan} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          <span className="text-xs sm:text-sm">Download Template</span>
                        </a>
                      </Button>
                    </div>
                  </div>
                )}

                {settings.url_file_form_peminjaman && (
                  <div className="border rounded-lg p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3">
                        <Download className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 flex-shrink-0 mt-1 sm:mt-0" />
                        <div className="min-w-0">
                          <h4 className="font-medium text-sm sm:text-base">File Form Peminjaman</h4>
                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                            File form peminjaman yang dapat diunduh
                          </p>
                        </div>
                      </div>
                      <Button asChild variant="outline" size="sm" className="self-start sm:self-auto shrink-0">
                        <a 
                          href={settings.url_file_form_peminjaman} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          <span className="text-xs sm:text-sm">Download File</span>
                        </a>
                      </Button>
                    </div>
                  </div>
                )}

                {settings.url_form_peminjaman && (
                  <div className="border rounded-lg p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3">
                        <ExternalLink className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 flex-shrink-0 mt-1 sm:mt-0" />
                        <div className="min-w-0">
                          <h4 className="font-medium text-sm sm:text-base">Form Peminjaman Online</h4>
                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                            Form peminjaman online yang dapat diisi langsung
                          </p>
                        </div>
                      </div>
                      <Button asChild variant="outline" size="sm" className="self-start sm:self-auto shrink-0">
                        <a 
                          href={settings.url_form_peminjaman} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          <span className="text-xs sm:text-sm">Buka Form</span>
                        </a>
                      </Button>
                    </div>
                  </div>
                )}

                {!templates.template_form_peminjaman && 
                 !templates.template_surat_pengajuan && 
                 !settings.url_file_form_peminjaman && 
                 !settings.url_form_peminjaman && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm sm:text-base">Template belum tersedia. Silakan hubungi admin.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="kontak" className="space-y-4 sm:space-y-6">
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
              Informasi Kontak Admin
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {settings.nomer_handphone_admin && (
                  <div className="border rounded-lg p-3 sm:p-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start gap-3">
                        <Phone className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 flex-shrink-0 mt-1" />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-sm sm:text-base">Nomor Handphone Admin</h4>
                          <p className="text-xs sm:text-sm text-gray-600 mb-2">
                            Hubungi admin untuk informasi lebih lanjut
                          </p>
                          <p className="text-base sm:text-lg font-mono text-gray-800 break-all">
                            {settings.nomer_handphone_admin}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                          <a 
                            href={`tel:${settings.nomer_handphone_admin}`}
                          >
                            <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            <span className="text-xs sm:text-sm">Telepon</span>
                          </a>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                          <a 
                            href={`https://wa.me/${settings.nomer_handphone_admin.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            <span className="text-xs sm:text-sm">WhatsApp</span>
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border rounded-lg p-3 sm:p-4 bg-blue-50">
                  <h4 className="font-medium text-blue-800 mb-2 text-sm sm:text-base">Informasi Penting</h4>
                  <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
                    <li>• Hubungi admin untuk konsultasi sebelum mengajukan peminjaman</li>
                    <li>• Admin tersedia pada jam kerja (08:00 - 16:00 WIB)</li>
                    <li>• Untuk hal mendesak, silakan gunakan WhatsApp</li>
                    <li>• Pastikan melampirkan informasi acara yang lengkap saat menghubungi</li>
                  </ul>
                </div>

                {!settings.nomer_handphone_admin && (
                  <div className="text-center py-8 text-gray-500">
                    <Phone className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm sm:text-base">Informasi kontak belum tersedia. Silakan hubungi admin melalui sistem.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
} 
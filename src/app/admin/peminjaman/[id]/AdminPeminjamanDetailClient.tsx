"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Package, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Users,
  GraduationCap,
  Building,
  Eye,
  MessageSquare,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { usePeminjamanAdmin } from "@/hooks/usePeminjamanAdmin";
import { PeminjamanWithItems } from "@/service/peminjamanService";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  getAdminPeminjamanDetailAction,
  validatePeminjamanAction,
  rejectPeminjamanAction,
  validatePickupAction,
  rejectPickupAction,
  validateReturnAction,
  rejectReturnAction,
  adminCancelPeminjamanAction,
} from "@/actions/peminjamanActions";
import {
  StatusPeminjaman,
  StatusPengajuan,
  StatusPengambilan,
  StatusPengembalian,
} from "@prisma/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AdminPeminjamanDetailClientProps {
  adminId: string;
  peminjamanId: string;
}

export default function AdminPeminjamanDetailClient({ adminId, peminjamanId }: AdminPeminjamanDetailClientProps) {
  const router = useRouter();
  const [peminjaman, setPeminjaman] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectMessage, setRejectMessage] = useState("");
  const [showRejectReturnDialog, setShowRejectReturnDialog] = useState(false);
  const [rejectReturnMessage, setRejectReturnMessage] = useState("");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelMessage, setCancelMessage] = useState("");
  const [expandedSarana, setExpandedSarana] = useState<Record<string, boolean>>({});
  const { getPeminjamanDetail, validatePeminjaman, rejectPeminjaman, cancelPeminjaman } = usePeminjamanAdmin(adminId);

  useEffect(() => {
    loadPeminjaman();
  }, [peminjamanId]);

  const loadPeminjaman = async () => {
    try {
      const result = await getAdminPeminjamanDetailAction(adminId, peminjamanId);
      if (result.data) {
        setPeminjaman(result.data);
      }
    } catch (error) {
      console.error("Error loading peminjaman:", error);
      toast.error("Gagal memuat data peminjaman");
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    try {
      await validatePeminjamanAction(adminId, peminjamanId);
      toast.success("Pengajuan berhasil divalidasi");
      loadPeminjaman();
    } catch (error) {
      toast.error("Gagal memvalidasi pengajuan");
    }
  };

  const handleReject = async () => {
    try {
      await rejectPeminjamanAction(adminId, peminjamanId, rejectMessage);
      setShowRejectDialog(false);
      setRejectMessage("");
      toast.success("Pengajuan berhasil ditolak");
      loadPeminjaman();
    } catch (error) {
      toast.error("Gagal menolak pengajuan");
    }
  };

  const handleValidateReturn = async () => {
    try {
      await validateReturnAction(adminId, peminjamanId);
      toast.success("Pengembalian berhasil divalidasi");
      loadPeminjaman();
    } catch (error) {
      toast.error("Gagal memvalidasi pengembalian");
    }
  };

  const handleRejectReturn = async () => {
    try {
      await rejectReturnAction(adminId, peminjamanId, rejectReturnMessage);
      setShowRejectReturnDialog(false);
      setRejectReturnMessage("");
      toast.success("Pengembalian berhasil ditolak");
      loadPeminjaman();
    } catch (error) {
      toast.error("Gagal menolak pengembalian");
    }
  };

  const handleCancel = async () => {
    try {
      await adminCancelPeminjamanAction(adminId, peminjamanId, cancelMessage);
      setShowCancelDialog(false);
      setCancelMessage("");
      toast.success("Peminjaman berhasil dibatalkan");
      loadPeminjaman();
    } catch (error) {
      toast.error("Gagal membatalkan peminjaman");
    }
  };

  const getStatusBadge = (status: StatusPeminjaman) => {
    const variants = {
      [StatusPeminjaman.DALAM_PROSES]: { color: "text-yellow-600 bg-yellow-50 border-yellow-200", icon: Clock },
      [StatusPeminjaman.DITERIMA]: { color: "text-green-600 bg-green-50 border-green-200", icon: CheckCircle2 },
      [StatusPeminjaman.DITOLAK]: { color: "text-red-600 bg-red-50 border-red-200", icon: XCircle },
      [StatusPeminjaman.SELESAI]: { color: "text-blue-600 bg-blue-50 border-blue-200", icon: CheckCircle2 },
      [StatusPeminjaman.DIBATALKAN]: { color: "text-gray-600 bg-gray-50 border-gray-200", icon: XCircle },
    };
    
    const config = variants[status] || variants[StatusPeminjaman.DALAM_PROSES];
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const getStatusPengajuanBadge = (status: StatusPengajuan) => {
    const variants = {
      [StatusPengajuan.MENUNGGU_PENINJAUAN]: { color: "text-yellow-600 bg-yellow-50 border-yellow-200", icon: Clock },
      [StatusPengajuan.PENGAJUAN_DITERIMA]: { color: "text-green-600 bg-green-50 border-green-200", icon: CheckCircle2 },
      [StatusPengajuan.PENGAJUAN_DITOLAK]: { color: "text-red-600 bg-red-50 border-red-200", icon: XCircle },
      [StatusPengajuan.DIBATALKAN]: { color: "text-gray-600 bg-gray-50 border-gray-200", icon: XCircle },
    };
    
    const config = variants[status] || variants[StatusPengajuan.MENUNGGU_PENINJAUAN];
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "-";
    return format(new Date(date), "PPP", { locale: id });
  };

  const formatDateTime = (date: Date | string | null | undefined) => {
    if (!date) return "-";
    return format(new Date(date), "PPP 'pukul' HH:mm", { locale: id });
  };

  const getTimelineSteps = () => {
    const steps = [
      {
        id: "pengajuan",
        title: "Pengajuan Disubmit",
        description: "Peminjam mengajukan permohonan",
        date: peminjaman.tanggal_pengajuan,
        status: peminjaman.status_pengajuan,
        completed: true,
        current: peminjaman.status_pengajuan === StatusPengajuan.MENUNGGU_PENINJAUAN,
      },
      {
        id: "validasi",
        title: "Validasi Admin",
        description: "Admin memvalidasi pengajuan",
        date: peminjaman.status_pengajuan === StatusPengajuan.PENGAJUAN_DITERIMA ? peminjaman.tanggal_pengajuan : null,
        status: peminjaman.status_pengajuan,
        completed: peminjaman.status_pengajuan === StatusPengajuan.PENGAJUAN_DITERIMA,
        current: peminjaman.status_pengajuan === StatusPengajuan.MENUNGGU_PENINJAUAN,
      },
      {
        id: "pengambilan",
        title: "Pengambilan Barang",
        description: "Peminjam mengambil barang",
        date: peminjaman.tanggal_pengambilan,
        status: peminjaman.status_pengambilan,
        completed: peminjaman.status_pengambilan === StatusPengambilan.SUDAH_MENGAMBIL,
        current: peminjaman.status_pengambilan === StatusPengambilan.MENUNGGU_PENGAMBILAN,
      },
      {
        id: "pengembalian",
        title: "Pengembalian Barang",
        description: "Peminjam mengembalikan barang",
        date: peminjaman.tanggal_pengembalian,
        status: peminjaman.status_pengembalian,
        completed: peminjaman.status_pengembalian === StatusPengembalian.SUDAH_MENGEMBALIKAN,
        current: peminjaman.status_pengembalian === StatusPengembalian.MENUNGGU_VALIDASI,
      },
    ];

    return steps.filter(step => {
      if (step.id === "pengambilan") return peminjaman.status_pengambilan && peminjaman.status_pengambilan !== StatusPengambilan.NULL;
      if (step.id === "pengembalian") return peminjaman.status_pengembalian && peminjaman.status_pengembalian !== StatusPengembalian.NULL;
      return true;
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!peminjaman) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Peminjaman Tidak Ditemukan</h3>
              <p className="text-muted-foreground mb-4">Data peminjaman yang Anda cari tidak dapat ditemukan.</p>
              <Button onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canValidate = peminjaman.status_pengajuan === StatusPengajuan.MENUNGGU_PENINJAUAN;
  const canValidateReturn = peminjaman.status_pengembalian === StatusPengembalian.MENUNGGU_VALIDASI;
  const canCancel = ![StatusPeminjaman.SELESAI, StatusPeminjaman.DIBATALKAN].includes(peminjaman.status_peminjaman);

  const toggleSaranaExpanded = (saranaId: string) => {
    setExpandedSarana(prev => ({
      ...prev,
      [saranaId]: !prev[saranaId]
    }));
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Detail Peminjaman</h1>
            <p className="text-muted-foreground">ID: {peminjamanId}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {getStatusBadge(peminjaman.status_peminjaman)}
          {canCancel && (
            <Button variant="destructive" onClick={() => setShowCancelDialog(true)}>
              <XCircle className="w-4 h-4 mr-2" />
              Batalkan
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Informasi Acara
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">{peminjaman.nama_acara}</h3>
                <p className="text-muted-foreground">{peminjaman.deskripsi_acara}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Tanggal Mulai</p>
                    <p className="text-sm text-muted-foreground">{formatDate(peminjaman.tanggal_acara_dimulai)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Tanggal Selesai</p>
                    <p className="text-sm text-muted-foreground">{formatDate(peminjaman.tanggal_acara_berakhir)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Jumlah Peserta</p>
                    <p className="text-sm text-muted-foreground">{peminjaman.jumlah_peserta} orang</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Surat Pengajuan</p>
                    {peminjaman.url_surat_pengajuan ? (
                      <div className="flex gap-2 mt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                          onClick={() => window.open(peminjaman.url_surat_pengajuan, '_blank')}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Lihat File
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="hover:bg-green-50 hover:text-green-700 transition-colors"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = peminjaman.url_surat_pengajuan;
                            link.download = `Surat_Pengajuan_${peminjaman.nama_acara.replace(/\s+/g, '_')}.pdf`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Unduh
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-md">
                          File tidak tersedia
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Daftar Sarpras
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <Tabs defaultValue="sarana" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="sarana">
                    Sarana ({peminjaman.peminjamanSarana.length})
                  </TabsTrigger>
                  <TabsTrigger value="prasarana">
                    Prasarana ({peminjaman.peminjamanPrasarana.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="sarana" className="mt-4">
                  {peminjaman.peminjamanSarana.length > 0 ? (
                    <div className="space-y-3">
                      {peminjaman.peminjamanSarana.map((item: any, index: number) => {
                        const saranaKey = `${item.saranaId || item.id || index}`;
                        const isExpanded = expandedSarana[saranaKey];
                        const isBernomor = item.sarana?.jenis === "BERNOMOR";
                        const hasDetailItems = item.peminjamanSaranaDetail?.length > 0;

                        return (
                          <div key={`sarana-${saranaKey}`} className="border rounded-lg overflow-hidden">
                            {/* Main Sarana Item */}
                            <div 
                              className={`flex items-center justify-between p-4 transition-colors ${
                                isBernomor && hasDetailItems ? 'hover:bg-muted/50 cursor-pointer' : ''
                              }`}
                              onClick={() => isBernomor && hasDetailItems && toggleSaranaExpanded(saranaKey)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                  <Package className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-medium">{item.sarana?.nama || 'Sarana Tidak Diketahui'}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Jumlah: {item.jumlah} {item.sarana?.satuanSatuan?.singkatan || 'unit'}
                                    {isBernomor && hasDetailItems && (
                                      <span className="ml-2">• {item.peminjamanSaranaDetail.length} item detail</span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {item.sudah_ambil && (
                                  <Badge variant="default" className="bg-green-100 text-green-800">
                                    Sudah Diambil
                                  </Badge>
                                )}
                                {item.sudah_kembali && (
                                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                                    Sudah Dikembalikan
                                  </Badge>
                                )}
                                {isBernomor && hasDetailItems && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSaranaExpanded(saranaKey);
                                    }}
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>

                            {/* Accordion Content - Detail Items for BERNOMOR sarana */}
                            {isBernomor && hasDetailItems && isExpanded && (
                              <div className="border-t bg-muted/20">
                                <div className="p-4">
                                  <h5 className="text-sm font-medium mb-3 text-muted-foreground">Detail Item yang Dipinjam:</h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {item.peminjamanSaranaDetail.map((detail: any, detailIndex: number) => (
                                      <div key={`detail-${detail.id || detailIndex}`} className="flex items-center justify-between p-3 bg-background rounded border hover:bg-muted/30 transition-colors">
                                        <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full bg-primary/60"></div>
                                          <span className="text-sm font-medium">
                                            {detail.nama_barang || `Item ${detailIndex + 1}`}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          {detail.sudah_ambil && (
                                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                              Diambil
                                            </Badge>
                                          )}
                                          {detail.sudah_kembali && (
                                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                              Dikembalikan
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Tidak ada sarana yang dipinjam</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="prasarana" className="mt-4">
                  {peminjaman.peminjamanPrasarana.length > 0 ? (
                    <div className="space-y-3">
                      {peminjaman.peminjamanPrasarana.map((item: any, index: number) => (
                        <div key={`prasarana-${item.prasarana?.id || item.id || index}`} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Building className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium">{item.prasarana?.nama || 'Prasarana Tidak Diketahui'}</h4>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{item.prasarana?.status || 'Status Tidak Diketahui'}</Badge>
                            {item.sudah_ambil && (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Sudah Diambil
                              </Badge>
                            )}
                            {item.sudah_kembali && (
                              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                                Sudah Dikembalikan
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Tidak ada prasarana yang dipinjam</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Timeline Peminjaman
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-6">
                {getTimelineSteps().map((step, index) => (
                  <div key={step.id} className="flex items-start gap-4">
                    <div className={`w-3 h-3 rounded-full mt-2 ${
                      step.completed ? 'bg-green-500' : 
                      step.current ? 'bg-blue-500' : 'bg-gray-300'
                    }`} />
                    
                    <div className="flex-1 pb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{step.title}</h3>
                          <p className="text-sm text-muted-foreground mb-1">{step.description}</p>
                          {step.date && (
                            <p className="text-xs text-muted-foreground">
                              {formatDateTime(step.date)}
                            </p>
                          )}
                        </div>
                        
                        {/* Action buttons for current steps */}
                        {step.id === "validasi" && canValidate && (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleValidate}>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Validasi
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => setShowRejectDialog(true)}>
                              <XCircle className="w-4 h-4 mr-2" />
                              Tolak
                            </Button>
                          </div>
                        )}
                        
                        {step.id === "pengembalian" && canValidateReturn && (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleValidateReturn}>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Validasi Pengembalian
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => setShowRejectReturnDialog(true)}>
                              <XCircle className="w-4 h-4 mr-2" />
                              Tolak Pengembalian
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Borrower Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informasi Peminjam
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={peminjaman.user.image} />
                  <AvatarFallback>
                    {peminjaman.user.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{peminjaman.user.name}</h3>
                  <p className="text-sm text-muted-foreground">{peminjaman.user.email}</p>
                </div>
              </div>
              
              <Separator />
              
              {peminjaman.user.mahasiswa && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Mahasiswa</span>
                  </div>
                  
                  <div className="space-y-2 pl-6">
                    <div>
                      <p className="text-sm font-medium">NIM</p>
                      <p className="text-sm text-muted-foreground">{peminjaman.user.mahasiswa.nim || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Jurusan</p>
                      <p className="text-sm text-muted-foreground">{peminjaman.user.mahasiswa.jurusanJurusan?.nama || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Program Studi</p>
                      <p className="text-sm text-muted-foreground">{peminjaman.user.mahasiswa.prodiProdi?.nama || '-'}</p>
                    </div>
                  </div>
                </div>
              )}

              {peminjaman.user.pegawai && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Pegawai</span>
                  </div>
                  
                  <div className="space-y-2 pl-6">
                    <div>
                      <p className="text-sm font-medium">NIP</p>
                      <p className="text-sm text-muted-foreground">{peminjaman.user.pegawai.nomer_induk || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Unit</p>
                      <p className="text-sm text-muted-foreground">{peminjaman.user.pegawai.unit_pegawai || '-'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Ormawa Information */}
              {peminjaman.ormawa && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Organisasi/UKM</span>
                  </div>
                  
                  <div className="space-y-2 pl-6">
                    <div>
                      <p className="text-sm font-medium">Nama Organisasi</p>
                      <p className="text-sm text-muted-foreground">{peminjaman.ormawa.nama}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Status Peminjaman
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
              <div>
                <p className="text-sm font-medium mb-2">Status Pengajuan</p>
                {getStatusPengajuanBadge(peminjaman.status_pengajuan)}
              </div>
              
              {peminjaman.status_pengambilan && peminjaman.status_pengambilan !== StatusPengambilan.NULL && (
                <div>
                  <p className="text-sm font-medium mb-2">Status Pengambilan</p>
                  <Badge className={
                    peminjaman.status_pengambilan === StatusPengambilan.SUDAH_MENGAMBIL 
                      ? "text-green-600 bg-green-50 border-green-200" 
                      : "text-yellow-600 bg-yellow-50 border-yellow-200"
                  }>
                    {peminjaman.status_pengambilan === StatusPengambilan.SUDAH_MENGAMBIL ? (
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                    ) : (
                      <Clock className="w-3 h-3 mr-1" />
                    )}
                    {peminjaman.status_pengambilan.replace(/_/g, ' ')}
                  </Badge>
                </div>
              )}
              
              {peminjaman.status_pengembalian && peminjaman.status_pengembalian !== StatusPengembalian.NULL && (
                <div>
                  <p className="text-sm font-medium mb-2">Status Pengembalian</p>
                  <Badge className={
                    peminjaman.status_pengembalian === StatusPengembalian.SUDAH_MENGEMBALIKAN 
                      ? "text-blue-600 bg-blue-50 border-blue-200" 
                      : peminjaman.status_pengembalian === StatusPengembalian.MENUNGGU_VALIDASI
                      ? "text-orange-600 bg-orange-50 border-orange-200"
                      : "text-yellow-600 bg-yellow-50 border-yellow-200"
                  }>
                    {peminjaman.status_pengembalian === StatusPengembalian.SUDAH_MENGEMBALIKAN ? (
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                    ) : (
                      <Clock className="w-3 h-3 mr-1" />
                    )}
                    {peminjaman.status_pengembalian.replace(/_/g, ' ')}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Important Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Tanggal Penting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
              <div>
                <p className="text-sm font-medium">Tanggal Pengajuan</p>
                <p className="text-sm text-muted-foreground">{formatDateTime(peminjaman.tanggal_pengajuan)}</p>
              </div>
              
              {peminjaman.tanggal_pengambilan && (
                <div>
                  <p className="text-sm font-medium">Tanggal Pengambilan</p>
                  <p className="text-sm text-muted-foreground">{formatDateTime(peminjaman.tanggal_pengambilan)}</p>
                </div>
              )}
              
              {peminjaman.tanggal_pengembalian && (
                <div>
                  <p className="text-sm font-medium">Tanggal Pengembalian</p>
                  <p className="text-sm text-muted-foreground">{formatDateTime(peminjaman.tanggal_pengembalian)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Message */}
          {peminjaman.massage_admin && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <MessageSquare className="w-5 h-5" />
                  Pesan Admin
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <p className="text-sm text-red-700">{peminjaman.massage_admin}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Pengajuan</DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan pengajuan peminjaman ini.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Masukkan alasan penolakan..."
              value={rejectMessage}
              onChange={(e) => setRejectMessage(e.target.value)}
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectMessage.trim()}
              >
                Tolak Pengajuan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectReturnDialog} onOpenChange={setShowRejectReturnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Pengembalian</DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan pengembalian peminjaman ini. Status akan dikembalikan ke "Menunggu Pengembalian".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Masukkan alasan penolakan pengembalian (contoh: barang tidak lengkap, kondisi rusak, dll)..."
              value={rejectReturnMessage}
              onChange={(e) => setRejectReturnMessage(e.target.value)}
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRejectReturnDialog(false)}>
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectReturn}
                disabled={!rejectReturnMessage.trim()}
              >
                Tolak Pengembalian
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Batalkan Peminjaman</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin membatalkan peminjaman ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Textarea
              placeholder="Berikan alasan pembatalan (opsional)..."
              value={cancelMessage}
              onChange={(e) => setCancelMessage(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Ya, Batalkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { StatusPeminjaman, StatusPengajuan, StatusPengambilan, StatusPengembalian } from "@prisma/client";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle,
  Calendar,
  Users,
  FileText,
  Package,
  Edit3,
  Trash2,
  Download,
  Eye,
  ClipboardList,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePeminjamanPeminjam } from "@/hooks/usePeminjamanPeminjam";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { PeminjamanWithItems } from "@/service/peminjamanService";
import { ConfirmationDialog } from "@/components/peminjaman/ConfirmationDialog";
import { PickupChecklistDialog } from "@/components/peminjaman/PickupChecklistDialog";
import { ReturnChecklistDialog } from "@/components/peminjaman/ReturnChecklistDialog";
import PeminjamanDialog from "@/components/peminjaman/PeminjamanDialog";

interface PeminjamanDetailClientProps {
  peminjamanId: string;
}

export default function PeminjamanDetailClient({ peminjamanId }: PeminjamanDetailClientProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const {
    isLoading,
    error,
    getPeminjamanDetail,
    updatePeminjaman,
    confirmPickup,
    confirmReturn,
    cancelPeminjaman,
    updatePickupChecklist,
    updateReturnChecklist,
  } = usePeminjamanPeminjam(userId || "");

  const [peminjaman, setPeminjaman] = useState<PeminjamanWithItems | null>(null);
  
  // Dialog states
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showConfirmPickupDialog, setShowConfirmPickupDialog] = useState(false);
  const [showConfirmReturnDialog, setShowConfirmReturnDialog] = useState(false);
  const [showPickupChecklistDialog, setShowPickupChecklistDialog] = useState(false);
  const [showReturnChecklistDialog, setShowReturnChecklistDialog] = useState(false);
  const [expandedSarana, setExpandedSarana] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (userId) {
      loadPeminjaman();
    }
  }, [userId]);

  const loadPeminjaman = async () => {
    const result = await getPeminjamanDetail(peminjamanId);
    if (result) {
      setPeminjaman(result);
    }
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "-";
    return format(new Date(date), "dd MMMM yyyy", { locale: id });
  };

  const formatDateTime = (date: Date | null | undefined) => {
    if (!date) return "-";
    return format(new Date(date), "dd MMMM yyyy, HH:mm", { locale: id });
  };

  const toggleSaranaExpanded = (saranaId: string) => {
    setExpandedSarana(prev => ({
      ...prev,
      [saranaId]: !prev[saranaId]
    }));
  };

  const handleCancelPeminjaman = async () => {
    try {
      await cancelPeminjaman(peminjamanId);
      toast.success("Peminjaman berhasil dibatalkan");
      loadPeminjaman();
    } catch (error) {
      toast.error("Gagal membatalkan peminjaman");
    }
    setShowCancelDialog(false);
  };

  const handleConfirmPickup = async () => {
    try {
      await confirmPickup(peminjamanId);
      toast.success("Pengambilan berhasil dikonfirmasi");
      loadPeminjaman();
    } catch (error) {
      toast.error("Gagal mengkonfirmasi pengambilan");
    }
    setShowConfirmPickupDialog(false);
  };

  const handleConfirmReturn = async () => {
    try {
      await confirmReturn(peminjamanId);
      toast.success("Pengembalian berhasil dikonfirmasi");
      loadPeminjaman();
    } catch (error) {
      toast.error("Gagal mengkonfirmasi pengembalian");
    }
    setShowConfirmReturnDialog(false);
  };

  const handleUpdatePeminjaman = async (data: any) => {
    try {
      await updatePeminjaman(peminjamanId, data);
      toast.success("Peminjaman berhasil diupdate");
      loadPeminjaman();
    } catch (error) {
      toast.error("Gagal mengupdate peminjaman");
    }
    setShowEditDialog(false);
  };

  const handlePickupChecklist = async (checklist: {
    prasaranaIds?: string[];
    saranaItems?: { saranaId: string; jumlah: number; detailItems?: string[] }[];
  }) => {
    try {
      await updatePickupChecklist(peminjamanId, checklist);
      toast.success("Checklist pengambilan berhasil disimpan");
      loadPeminjaman();
    } catch (error) {
      toast.error("Gagal menyimpan checklist pengambilan");
    }
  };

  const handleReturnChecklist = async (checklist: {
    prasaranaIds?: string[];
    saranaItems?: { saranaId: string; jumlah?: number; detailItems?: string[] }[];
  }) => {
    try {
      await updateReturnChecklist(peminjamanId, checklist);
      toast.success("Checklist pengembalian berhasil disimpan");
      loadPeminjaman();
    } catch (error) {
      toast.error("Gagal menyimpan checklist pengembalian");
    }
  };

  const getStatusBadge = (status: StatusPeminjaman) => {
    const variants = {
      DALAM_PROSES: { variant: "secondary" as const, icon: Clock, label: "Dalam Proses" },
      DITERIMA: { variant: "default" as const, icon: CheckCircle2, label: "Diterima" },
      DITOLAK: { variant: "destructive" as const, icon: XCircle, label: "Ditolak" },
      DIBATALKAN: { variant: "outline" as const, icon: XCircle, label: "Dibatalkan" },
      SELESAI: { variant: "default" as const, icon: CheckCircle2, label: "Selesai" },
    };
    
    const config = variants[status] || variants.DALAM_PROSES;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getStatusPengajuanBadge = (status: StatusPengajuan) => {
    const variants = {
      MENUNGGU_PENINJAUAN: { variant: "secondary" as const, icon: Clock, label: "Menunggu Peninjauan" },
      PENGAJUAN_DITERIMA: { variant: "default" as const, icon: CheckCircle2, label: "Diterima" },
      PENGAJUAN_DITOLAK: { variant: "destructive" as const, icon: XCircle, label: "Ditolak" },
      DIBATALKAN: { variant: "outline" as const, icon: XCircle, label: "Dibatalkan" },
    };
    
    const config = variants[status] || variants.MENUNGGU_PENINJAUAN;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getTimelineSteps = () => {
    if (!peminjaman) return [];
    
    return [
      {
        id: "pengajuan",
        title: "Pengajuan Disubmit",
        description: "Pengajuan peminjaman telah dikirim",
        date: peminjaman.tanggal_pengajuan,
        status: "completed",
        icon: FileText
      },
      {
        id: "review",
        title: "Review Pengajuan",
        description: peminjaman.status_pengajuan === "PENGAJUAN_DITERIMA" ? "Pengajuan disetujui" :
                    peminjaman.status_pengajuan === "PENGAJUAN_DITOLAK" ? "Pengajuan ditolak" : "Menunggu review admin",
        date: peminjaman.status_pengajuan === "PENGAJUAN_DITERIMA" ? peminjaman.tanggal_pengajuan : null,
        status: peminjaman.status_pengajuan === "PENGAJUAN_DITERIMA" ? "completed" :
                peminjaman.status_pengajuan === "PENGAJUAN_DITOLAK" ? "rejected" : "pending",
        icon: Eye
      },
      {
        id: "pengambilan",
        title: "Pengambilan Barang",
        description: peminjaman.status_pengambilan === "SUDAH_MENGAMBIL" ? "Barang telah diambil" : "Menunggu pengambilan barang",
        date: peminjaman.tanggal_pengambilan,
        status: peminjaman.status_pengambilan === "SUDAH_MENGAMBIL" ? "completed" : "pending",
        icon: Package
      },
      {
        id: "pengembalian",
        title: "Pengembalian Barang",
        description: peminjaman.status_pengembalian === "SUDAH_MENGEMBALIKAN" ? "Barang telah dikembalikan" : "Menunggu pengembalian barang",
        date: peminjaman.tanggal_pengembalian,
        status: peminjaman.status_pengembalian === "SUDAH_MENGEMBALIKAN" ? "completed" : "pending",
        icon: CheckCircle2
      }
    ];
  };

  const getTimelineIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-gray-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  // Check if user can edit (only when status is MENUNGGU_PENINJAUAN)
  const canEdit = peminjaman?.status_pengajuan === "MENUNGGU_PENINJAUAN";
  
  // Check if user can access pickup checklist (when approved but not yet picked up)
  const canAccessPickupChecklist = peminjaman?.status_pengajuan === "PENGAJUAN_DITERIMA" && 
                                   peminjaman?.status_pengambilan !== "SUDAH_MENGAMBIL";
  
  // Check if user can access return checklist (after pickup, regardless of return status)
  const canAccessReturnChecklist = peminjaman?.status_pengambilan === "SUDAH_MENGAMBIL" && 
                                   peminjaman?.status_pengembalian !== "SUDAH_MENGEMBALIKAN";

  if (isLoading || !peminjaman) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Memuat detail peminjaman...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
            <p className="text-red-500 font-medium">Terjadi kesalahan</p>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          asChild
          className="group"
        >
          <Link href="/peminjam/peminjaman">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Kembali
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          {peminjaman.url_surat_pengajuan && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                onClick={() => peminjaman.url_surat_pengajuan && window.open(peminjaman.url_surat_pengajuan, '_blank')}
              >
                <Eye className="w-4 h-4 mr-2" />
                Lihat File
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="hover:bg-green-50 hover:text-green-700 transition-colors"
                onClick={() => {
                  if (peminjaman.url_surat_pengajuan) {
                    const link = document.createElement('a');
                    link.href = peminjaman.url_surat_pengajuan;
                    link.download = `Surat_Pengajuan_${peminjaman.nama_acara.replace(/\s+/g, '_')}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Unduh Surat
              </Button>
            </div>
          )}
          
          {canEdit && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditDialog(true)}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowCancelDialog(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Batalkan
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Title & Status */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">{peminjaman.nama_acara}</h1>
            <p className="text-muted-foreground text-lg">{peminjaman.deskripsi_acara}</p>
          </div>
          <div className="flex flex-col gap-2">
            {getStatusBadge(peminjaman.status_peminjaman)}
            {getStatusPengajuanBadge(peminjaman.status_pengajuan)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Timeline Peminjaman
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {getTimelineSteps().map((step, index) => (
                  <div key={step.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-full border-2",
                        step.status === "completed" ? "bg-green-50 border-green-200" :
                        step.status === "rejected" ? "bg-red-50 border-red-200" :
                        "bg-gray-50 border-gray-200"
                      )}>
                        {getTimelineIcon(step.status)}
                      </div>
                      {index < getTimelineSteps().length - 1 && (
                        <div className={cn(
                          "w-0.5 h-12 mt-2",
                          step.status === "completed" ? "bg-green-200" : "bg-gray-200"
                        )} />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <h3 className="font-medium">{step.title}</h3>
                      <p className="text-sm text-muted-foreground mb-1">{step.description}</p>
                      {step.date && (
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(step.date)}
                        </p>
                      )}
                      
                      {/* Add checklist buttons next to timeline steps */}
                      {step.id === "pengambilan" && canAccessPickupChecklist && (
                        <div className="mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowPickupChecklistDialog(true)}
                          >
                            <ClipboardList className="w-4 h-4 mr-2" />
                            Checklist Pengambilan
                          </Button>
                        </div>
                      )}
                      
                      {step.id === "pengembalian" && canAccessReturnChecklist && (
                        <div className="mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowReturnChecklistDialog(true)}
                          >
                            <ClipboardList className="w-4 h-4 mr-2" />
                            Checklist Pengembalian
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {peminjaman.status_pengambilan === "MENUNGGU_PENGAMBILAN" && (
            <Card>
              <CardHeader>
                <CardTitle>Konfirmasi Pengambilan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Silakan konfirmasi pengambilan barang setelah Anda mengambil semua item yang dipinjam.
                </p>
                <Button onClick={() => setShowConfirmPickupDialog(true)}>
                  <Package className="w-4 h-4 mr-2" />
                  Konfirmasi Pengambilan
                </Button>
              </CardContent>
            </Card>
          )}

          {peminjaman.status_pengembalian === "MENUNGGU_PENGEMBALIAN" && (
            <Card>
              <CardHeader>
                <CardTitle>Konfirmasi Pengembalian</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Silakan konfirmasi pengembalian barang setelah Anda mengembalikan semua item yang dipinjam.
                  Anda dapat melakukan checklist pengembalian kapan saja setelah mengambil barang.
                </p>
                <Button onClick={() => setShowConfirmReturnDialog(true)}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Konfirmasi Pengembalian
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Item yang Dipinjam
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                      {peminjaman.peminjamanSarana.map((item, index) => {
                        const saranaKey = `${item.saranaId || item.id || index}`;
                        const isExpanded = expandedSarana[saranaKey];
                        const isBernomor = item.sarana?.jenis === "BERNOMOR";
                        const hasDetailItems = item.peminjamanSaranaDetail?.length > 0;

                        return (
                          <div key={`sarana-item-${saranaKey}`} className="border rounded-lg overflow-hidden">
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
                                  <h5 className="text-sm font-medium mb-3 text-muted-foreground">Detail Nomor Seri yang Dipinjam:</h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {item.peminjamanSaranaDetail.map((detail: any, detailIndex: number) => {
                                      // Determine if this is a custom serial (non-alphanumeric pattern) or selected serial
                                      const isCustomSerial = detail.nama_barang && !detail.nama_barang.match(/^[A-Z0-9]+$/);
                                      
                                      return (
                                                                                <div key={`detail-${detail.id || detailIndex}`} className="flex items-center justify-between p-3 rounded border transition-colors bg-gray-50 border-gray-200 hover:bg-gray-100">
                                          <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                                            <div className="flex flex-col">
                                              <span className="text-sm font-medium">
                                                {detail.nama_barang || `Item ${detailIndex + 1}`}
                                              </span>
                                              </div>
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
                                      );
                                    })}
                                  </div>
                                  
                                  {/* Summary of serial types */}
                                  <div className="mt-3 p-2 bg-gray-50 rounded-md">
                                    <div className="flex items-center justify-center text-xs text-gray-600">
                                      <span>Total: {item.peminjamanSaranaDetail.length} item</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Tidak ada sarana yang dipinjam
                    </p>
                  )}
                </TabsContent>
                
                <TabsContent value="prasarana" className="mt-4">
                  {peminjaman.peminjamanPrasarana.length > 0 ? (
                    <div className="space-y-3">
                      {peminjaman.peminjamanPrasarana.map((item, index) => (
                        <div key={`prasarana-item-${item.id || index}`} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{item.prasarana?.nama || 'Prasarana Tidak Diketahui'}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{item.prasarana?.status || 'Status Tidak Diketahui'}</Badge>
                            {item.sudah_ambil && (
                              <Badge variant="default">Sudah Diambil</Badge>
                            )}
                            {item.sudah_kembali && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Sudah Dikembalikan
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Tidak ada prasarana yang dipinjam
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Informasi Acara
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tanggal Mulai</p>
                <p className="font-medium">{formatDate(peminjaman.tanggal_acara_dimulai)}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tanggal Selesai</p>
                <p className="font-medium">{formatDate(peminjaman.tanggal_acara_berakhir)}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Jumlah Peserta</p>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{peminjaman.jumlah_peserta} orang</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organization Info */}
          {peminjaman.ormawa && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Organisasi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nama Organisasi/UKM</p>
                  <p className="font-medium">{peminjaman.ormawa.nama}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dates Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Jadwal Penting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tanggal Pengajuan</p>
                <p className="font-medium">{formatDate(peminjaman.tanggal_pengajuan)}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tanggal Pengambilan</p>
                <p className="font-medium">{formatDate(peminjaman.tanggal_pengambilan)}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tanggal Pengembalian</p>
                <p className="font-medium">{formatDate(peminjaman.tanggal_pengembalian)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Admin Message */}
          {peminjaman.massage_admin && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  Pesan Admin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-700">{peminjaman.massage_admin}</p>
                {(peminjaman.status_pengajuan === "PENGAJUAN_DITOLAK" && canEdit) && (
                  <div className="mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEditDialog(true)}
                      className="border-red-300 text-red-700 hover:bg-red-100"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit & Kirim Ulang
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <ConfirmationDialog
        title="Batalkan Pengajuan"
        description="Apakah Anda yakin ingin membatalkan pengajuan peminjaman ini? Tindakan ini tidak dapat dibatalkan."
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={handleCancelPeminjaman}
        confirmText="Ya, Batalkan"
        cancelText="Tidak, Kembali"
        variant="destructive"
      />

      <ConfirmationDialog
        title="Konfirmasi Pengambilan"
        description="Apakah Anda yakin telah mengambil semua barang yang dipinjam? Pastikan semua item sudah diterima dengan baik."
        open={showConfirmPickupDialog}
        onOpenChange={setShowConfirmPickupDialog}
        onConfirm={handleConfirmPickup}
        confirmText="Ya, Sudah Diambil"
        cancelText="Belum"
      />

      <ConfirmationDialog
        title="Konfirmasi Pengembalian"
        description="Apakah Anda yakin telah mengembalikan semua barang yang dipinjam? Pastikan semua item sudah dikembalikan dalam kondisi baik."
        open={showConfirmReturnDialog}
        onOpenChange={setShowConfirmReturnDialog}
        onConfirm={handleConfirmReturn}
        confirmText="Ya, Sudah Dikembalikan"
        cancelText="Belum"
      />

      {/* Edit Dialog */}
      {showEditDialog && (
        <PeminjamanDialog
          user={session?.user || {
            id: userId || "",
            name: "",
            email: "",
            role: "PEMINJAM"
          }}
          onSubmit={handleUpdatePeminjaman}
          open={showEditDialog}
          setOpen={setShowEditDialog}
          initialData={peminjaman}
        />
      )}

      {/* Checklist Dialogs */}
      {showPickupChecklistDialog && (
        <PickupChecklistDialog
          open={showPickupChecklistDialog}
          onOpenChange={setShowPickupChecklistDialog}
          peminjaman={peminjaman}
          onSubmit={handlePickupChecklist}
        />
      )}

      {showReturnChecklistDialog && (
        <ReturnChecklistDialog
          open={showReturnChecklistDialog}
          onOpenChange={setShowReturnChecklistDialog}
          peminjaman={peminjaman}
          onSubmit={handleReturnChecklist}
        />
      )}
    </div>
  );
} 
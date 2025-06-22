"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { CircleIcon, MapPinIcon, AlertCircleIcon, CheckCircleIcon, XCircleIcon, ClockIcon, ImageIcon } from "lucide-react"
import { GoogleDriveImage } from "@/components/ui/google-drive-image"

interface DetailSarana {
  id: string
  nomer_seri?: string | null
  status: "TERSEDIA" | "DIPINJAM" | "RUSAK" | "HILANG"
  lokasi?: string | null
}

interface Sarana {
  id: string
  nama: string
  kategoriSarana: { nama: string }
  satuanSatuan: { nama: string }
  jenis: "BERNOMOR" | "TIDAK_BERNOMOR"
  stok: number
  sisa: number
  lokasi?: string
  image_url?: string
  detailSarana?: DetailSarana[]
}

interface SaranaDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: Sarana | null
}

export function SaranaDetailDialog({
  open,
  onOpenChange,
  data
}: SaranaDetailDialogProps) {
  if (!data) return null

  const getStatusIcon = (status: DetailSarana['status']) => {
    switch (status) {
      case "TERSEDIA":
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />
      case "DIPINJAM":
        return <ClockIcon className="h-4 w-4 text-yellow-500" />
      case "RUSAK":
        return <AlertCircleIcon className="h-4 w-4 text-red-500" />
      case "HILANG":
        return <XCircleIcon className="h-4 w-4 text-gray-500" />
      default:
        return <CircleIcon className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: DetailSarana['status']) => {
    switch (status) {
      case "TERSEDIA":
        return "text-green-500 bg-green-50"
      case "DIPINJAM":
        return "text-yellow-600 bg-yellow-50"
      case "RUSAK":
        return "text-red-500 bg-red-50"
      case "HILANG":
        return "text-gray-500 bg-gray-50"
      default:
        return "text-gray-500 bg-gray-50"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[85vw] lg:max-w-[700px] max-h-[95vh] sm:max-h-[85vh] lg:max-h-[600px] p-0 gap-0 overflow-auto">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="flex-shrink-0 p-4 sm:p-5 pb-3 border-b">
            <DialogTitle className="text-lg sm:text-xl font-semibold tracking-tight">{data.nama}</DialogTitle>
          </DialogHeader>
          
          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="info" className="h-full flex flex-col">
              <div className="flex-shrink-0 px-4 sm:px-5 pt-3">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="info" className="text-sm">Informasi Umum</TabsTrigger>
                  {data.jenis === "BERNOMOR" && (
                    <TabsTrigger value="detail" className="text-sm">Detail Item</TabsTrigger>
                  )}
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto px-4 sm:px-5 pb-4">
                {/* Info Tab */}
                <TabsContent value="info" className="mt-3 data-[state=active]:block">
                  <div className="flex flex-col space-y-4">
                    {/* Image and Basic Info */}
                    <div className="grid grid-cols-[140px,1fr] sm:grid-cols-[160px,1fr] gap-4">
                      <div className="w-full aspect-square rounded-lg overflow-hidden bg-white shadow-md ring-1 ring-black/10">
                        {data.image_url ? (
                          <GoogleDriveImage 
                            src={data.image_url} 
                            alt={data.nama}
                            fill
                            priority
                            className="object-cover"
                            sizes="160px"
                            fallback={
                              <div className="w-full h-full flex flex-col items-center justify-center bg-muted/30 text-muted-foreground gap-2">
                                <ImageIcon className="h-6 w-6" />
                                <p className="text-xs text-center">Gambar tidak dapat dimuat</p>
                              </div>
                            }
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-muted/30 text-muted-foreground gap-2">
                            <ImageIcon className="h-6 w-6" />
                            <p className="text-xs text-center">No Image</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-card rounded-lg border p-3 sm:p-4">
                        <h3 className="text-sm font-semibold mb-3">Detail Sarana</h3>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-muted-foreground mb-1">Kategori</p>
                            <p className="font-medium truncate">
                              {data.kategoriSarana.nama}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Satuan</p>
                            <p className="font-medium truncate">
                              {data.satuanSatuan.nama}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-muted-foreground mb-1">Jenis Barang</p>
                            <Badge variant={data.jenis === "BERNOMOR" ? "default" : "secondary"} className="text-xs">
                              {data.jenis === "BERNOMOR" ? "Bernomor" : "Tidak Bernomor"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stock and Location Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-card rounded-lg border p-3 sm:p-4">
                        <h3 className="text-sm font-semibold mb-3">Informasi Stok</h3>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Stok</span>
                            <span className="font-medium">{data.jenis === "BERNOMOR" ? (data.detailSarana || []).length : data.stok} {data.satuanSatuan.nama}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tersedia</span>
                            <span className="font-medium">{data.jenis === "BERNOMOR" 
                              ? (data.detailSarana || []).filter(d => d.status === "TERSEDIA").length 
                              : data.sisa} {data.satuanSatuan.nama}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-card rounded-lg border p-3 sm:p-4">
                        <h3 className="text-sm font-semibold mb-3">Lokasi Penyimpanan</h3>
                        <div className="flex items-center gap-2 text-xs">
                          <MapPinIcon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium truncate" title={data.lokasi || undefined}>
                            {data.lokasi || "Belum ditentukan"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Detail Tab */}
                {data.jenis === "BERNOMOR" && (
                  <TabsContent value="detail" className="mt-3 data-[state=active]:block">
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold">Daftar Item ({(data.detailSarana || []).length} item)</h3>
                      <div className="space-y-1.5">
                        {(data.detailSarana || []).map((detail) => (
                          <div
                            key={detail.id}
                            className="flex items-center justify-between p-2.5 rounded border bg-card hover:bg-accent/30 transition-colors text-xs"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate text-sm">
                                {detail.nomer_seri || "No Serial Number"}
                              </p>
                              <p className="text-muted-foreground truncate" title={detail.lokasi || undefined}>
                                {detail.lokasi}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 ml-3">
                              {getStatusIcon(detail.status)}
                              <span className="text-xs font-medium whitespace-nowrap">
                                {detail.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                )}
              </div>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
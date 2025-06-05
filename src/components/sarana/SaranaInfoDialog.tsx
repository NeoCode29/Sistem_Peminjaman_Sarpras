"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SaranaWithRelations } from "@/service/saranaService"
import { StatusPeminjaman, JenisBarang } from "@prisma/client"
import Image from "next/image"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageIcon } from "lucide-react"

interface SaranaInfoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data?: SaranaWithRelations
}

export function SaranaInfoDialog({
  open,
  onOpenChange,
  data,
}: SaranaInfoDialogProps) {
  if (!data) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px] w-[1000px]">
        <DialogHeader>
          <DialogTitle>Detail Sarana</DialogTitle>
          <DialogDescription>
            Informasi lengkap mengenai sarana
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-[4fr_6fr] gap-6">
          {/* Image Section */}
          <div className="space-y-4">
            {data.image_url ? (
              <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
                <Image
                  src={data.image_url}
                  alt={`Gambar ${data.nama}`}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-square w-full items-center justify-center rounded-lg border bg-muted">
                <ImageIcon className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Content Section */}
          <Tabs defaultValue="info" className="w-full">
            <TabsList>
              <TabsTrigger value="info">Informasi</TabsTrigger>
              {data.jenis === JenisBarang.BERNOMOR && (
                <TabsTrigger value="details">Detail Item</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="info" className="mt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="font-medium">Nama</div>
                  <div className="col-span-3">{data.nama}</div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="font-medium">Kategori</div>
                  <div className="col-span-3">{data.kategoriSarana.nama}</div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="font-medium">Satuan</div>
                  <div className="col-span-3">
                    {data.satuanSatuan.nama} ({data.satuanSatuan.singkatan})
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="font-medium">Jenis</div>
                  <div className="col-span-3">
                    {data.jenis === JenisBarang.BERNOMOR ? "Barang Bernomor" : "Barang Tidak Bernomor"}
                  </div>
                </div>

                {data.jenis === JenisBarang.TIDAK_BERNOMOR && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="font-medium">Stok</div>
                    <div className="col-span-3">{data.stok}</div>
                  </div>
                )}

                {data.lokasi && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="font-medium">Lokasi</div>
                    <div className="col-span-3">{data.lokasi}</div>
                  </div>
                )}
              </div>
            </TabsContent>

            {data.jenis === JenisBarang.BERNOMOR && (
              <TabsContent value="details" className="mt-4">
                <ScrollArea className="h-[400px] rounded-md border p-4">
                  <div className="space-y-8">
                    {data.detailSarana.map((detail, index) => (
                      <div key={detail.id} className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">Item #{index + 1}</div>
                          {detail.nomer_seri && (
                            <div className="text-sm text-muted-foreground">
                              (No. Seri: {detail.nomer_seri})
                            </div>
                          )}
                        </div>

                        <div className="grid gap-2">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <div className="font-medium">Status</div>
                            <div className="col-span-3">
                              {detail.status === StatusPeminjaman.TERSEDIA ? "Tersedia" : "Dipinjam"}
                            </div>
                          </div>

                          {detail.lokasi && (
                            <div className="grid grid-cols-4 items-center gap-4">
                              <div className="font-medium">Lokasi</div>
                              <div className="col-span-3">{detail.lokasi}</div>
                            </div>
                          )}
                        </div>

                        {index < data.detailSarana.length - 1 && (
                          <Separator className="mt-4" />
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
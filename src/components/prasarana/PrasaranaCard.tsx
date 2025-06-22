"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit2Icon, Trash2Icon } from "lucide-react"
import { StatusSarpras } from "@prisma/client"
import Image from "next/image"

interface PrasaranaCardProps {
  id: string
  nama: string
  lokasi?: string | null
  kapasitas?: number | null
  deskripsi?: string | null
  kondisi?: string | null
  status: StatusSarpras
  image_url: { image_url: string }[]
  onEdit: () => void
  onDelete: () => void
}

export function PrasaranaCard({
  nama,
  lokasi,
  kapasitas,
  deskripsi,
  kondisi,
  status,
  image_url,
  onEdit,
  onDelete,
}: PrasaranaCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full">
        {image_url && image_url.length > 0 ? (
          <Image
            src={image_url[0].image_url}
            alt={nama}
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-muted flex items-center justify-center">
            <p className="text-muted-foreground">No image available</p>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            status === StatusSarpras.TERSEDIA 
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}>
            {status === StatusSarpras.TERSEDIA ? "Tersedia" : "Dipinjam"}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{nama}</h3>
        <div className="mt-2 space-y-1">
          {lokasi && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">Lokasi:</span> {lokasi}
            </div>
          )}
          {kapasitas && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">Kapasitas:</span> {kapasitas} orang
            </div>
          )}
          {kondisi && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">Kondisi:</span> {kondisi}
            </div>
          )}
          {deskripsi && (
            <p className="text-sm text-muted-foreground mt-2">{deskripsi}</p>
          )}
        </div>
        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onEdit}
          >
            <Edit2Icon className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            onClick={onDelete}
          >
            <Trash2Icon className="h-4 w-4 mr-2" />
            Hapus
          </Button>
        </div>
      </div>
    </Card>
  )
} 
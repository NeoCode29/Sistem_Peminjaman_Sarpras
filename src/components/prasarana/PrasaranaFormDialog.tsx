"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageIcon, Loader2, Plus, X } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { toast } from "sonner"
import { StatusSarpras } from "@prisma/client"
import { Label } from "@/components/ui/label"

const formSchema = z.object({
  nama: z.string().min(1, "Nama prasarana harus diisi"),
  lokasi: z.string().min(1, "Lokasi harus diisi"),
  kapasitas: z.coerce.number().min(1, "Kapasitas minimal 1"),
  deskripsi: z.string().min(1, "Deskripsi harus diisi"),
  status: z.enum(["TERSEDIA", "DIPINJAM", "RUSAK", "HILANG"]),
})

type FormValues = z.infer<typeof formSchema>

interface PrasaranaFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  data?: {
    id?: string
    nama?: string
    lokasi?: string
    kapasitas?: number
    deskripsi?: string
    status?: StatusSarpras
    existingImages?: { id: string; image_url: string }[]
  }
  onSubmit: (data: any) => Promise<void>
}

export function PrasaranaFormDialog({
  open,
  onOpenChange,
  mode,
  data,
  onSubmit
}: PrasaranaFormDialogProps) {
  const [formData, setFormData] = useState({
    nama: "",
    lokasi: "",
    kapasitas: 0,
    deskripsi: "",
    status: "TERSEDIA" as StatusSarpras
  })
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<{ id: string; image_url: string }[]>([])

  // Reset form when dialog is closed
  useEffect(() => {
    if (!open) {
      setFormData({
        nama: "",
        lokasi: "",
        kapasitas: 0,
        deskripsi: "",
        status: "TERSEDIA"
      })
      setSelectedImages([])
      setDragActive(false)
      setImagesToDelete([])
      setExistingImages([])
    } else if (data) {
      setFormData({
        nama: data.nama || "",
        lokasi: data.lokasi || "",
        kapasitas: data.kapasitas || 0,
        deskripsi: data.deskripsi || "",
        status: data.status || "TERSEDIA"
      })
      setExistingImages(data.existingImages || [])
    }
  }, [open, data])

  const handleImageUpload = (files: File[]) => {
    const validFiles = files.filter(file => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error(`File ${file.name} bukan gambar yang valid`)
        return false
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} melebihi batas ukuran 5MB`)
        return false
      }

      return true
    })

    const totalImages = existingImages.length - imagesToDelete.length + selectedImages.length + validFiles.length
    if (totalImages > 5) {
      toast.error("Maksimal 5 gambar yang dapat diupload")
      return
    }

    setSelectedImages(prev => [...prev, ...validFiles])
  }

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleRemoveExistingImage = (imageId: string) => {
    setImagesToDelete(prev => [...prev, imageId])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)

    try {
      // Validate form
      if (!formData.nama) {
        throw new Error("Nama prasarana harus diisi")
      }

      if (!formData.lokasi) {
        throw new Error("Lokasi harus diisi")
      }

      if (formData.kapasitas < 1) {
        throw new Error("Kapasitas minimal 1 orang")
      }

      // Calculate remaining images
      const remainingExistingImages = existingImages.filter(img => !imagesToDelete.includes(img.id))
      const totalImages = remainingExistingImages.length + selectedImages.length

      // Validate total images
      if (totalImages === 0) {
        throw new Error("Minimal satu gambar harus diupload")
      }

      if (totalImages > 5) {
        throw new Error("Maksimal 5 gambar yang dapat diupload")
      }

      await onSubmit({
        ...formData,
        images: selectedImages,
        imagesToDelete: imagesToDelete,
        existingImages: remainingExistingImages
      })

      // Reset form after successful submission
      setFormData({
        nama: "",
        lokasi: "",
        kapasitas: 0,
        deskripsi: "",
        status: "TERSEDIA"
      })
      setSelectedImages([])
      setImagesToDelete([])
      setExistingImages([])
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan prasarana")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[95vh] sm:max-h-[85vh] p-0 gap-0 overflow-auto">
        <DialogHeader className="p-4 sm:p-5 pb-0">
          <DialogTitle>
            {mode === "create" ? "Tambah Prasarana" : "Edit Prasarana"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-4 sm:p-5">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="nama">Nama Prasarana *</Label>
              <Input
                id="nama"
                value={formData.nama}
                onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                placeholder="Masukkan nama prasarana"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="lokasi">Lokasi *</Label>
              <Input
                id="lokasi"
                value={formData.lokasi}
                onChange={(e) => setFormData(prev => ({ ...prev, lokasi: e.target.value }))}
                placeholder="Masukkan lokasi prasarana"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="kapasitas">Kapasitas (Orang) *</Label>
              <Input
                id="kapasitas"
                type="number"
                min={1}
                value={formData.kapasitas}
                onChange={(e) => setFormData(prev => ({ ...prev, kapasitas: parseInt(e.target.value) || 0 }))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Textarea
                id="deskripsi"
                value={formData.deskripsi}
                onChange={(e) => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
                placeholder="Masukkan deskripsi prasarana"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: StatusSarpras) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger id="status" className="mt-1">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TERSEDIA">Tersedia</SelectItem>
                  <SelectItem value="DIPINJAM">Dipinjam</SelectItem>
                  <SelectItem value="RUSAK">Rusak</SelectItem>
                  <SelectItem value="HILANG">Hilang</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <Label>Gambar Prasarana *</Label>

            {/* Existing Images */}
            {mode === "edit" && existingImages.length > 0 && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {existingImages.map((img) => !imagesToDelete.includes(img.id) && (
                    <div key={img.id} className="relative aspect-video">
                      <Image
                        src={img.image_url}
                        alt="Existing image"
                        fill
                        className="object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => handleRemoveExistingImage(img.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            <div className="space-y-2">
              {selectedImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {selectedImages.map((file, index) => (
                    <div key={index} className="relative aspect-video">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  dragActive 
                    ? "border-primary bg-primary/5" 
                    : "border-muted-foreground/25 hover:border-primary/50"
                }`}
                onDragEnter={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setDragActive(true)
                }}
                onDragLeave={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setDragActive(false)
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setDragActive(false)
                  
                  if (e.dataTransfer.files?.length) {
                    handleImageUpload(Array.from(e.dataTransfer.files))
                  }
                }}
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-1">
                  {mode === "create" ? (
                    "Drag & drop gambar atau klik untuk upload"
                  ) : (
                    "Drag & drop gambar baru atau klik untuk upload"
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG hingga 5MB (Maks. 5 gambar)
                </p>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.length) {
                      handleImageUpload(Array.from(e.target.files))
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : mode === "create" ? (
                "Tambah Prasarana"
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
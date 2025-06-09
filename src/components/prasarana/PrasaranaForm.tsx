"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Image from "next/image"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageUpload } from "@/components/ui/image-upload"
import { toast } from "sonner"
import { StatusPeminjaman } from "@/types/statusPeminjaman"
import { prasaranaFormSchema } from "@/types/prasaranaTypes"

type FormData = z.infer<typeof prasaranaFormSchema>

interface PrasaranaFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: FormData) => Promise<void>
  initialData?: {
    id: string
    nama: string
    lokasi?: string | null
    kapasitas?: number | null
    deskripsi?: string | null
    kondisi?: string | null
    status: StatusPeminjaman
    image_url: { image_url: string }[]
  }
  isLoading?: boolean
}

export function PrasaranaForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading
}: PrasaranaFormProps) {
  const form = useForm<z.infer<typeof prasaranaFormSchema>>({
    resolver: zodResolver(prasaranaFormSchema),
    defaultValues: {
      nama: initialData?.nama || "",
      lokasi: initialData?.lokasi || "",
      kapasitas: initialData?.kapasitas || 0,
      deskripsi: initialData?.deskripsi || "",
      kondisi: initialData?.kondisi || "",
      status: initialData?.status || StatusPeminjaman.TERSEDIA,
      image_files: []
    }
  })

  // Get existing image URLs
  const existingImages = initialData?.image_url.map(img => img.image_url) || []
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])

  useEffect(() => {
    if (initialData) {
      form.reset({
        nama: initialData.nama,
        lokasi: initialData.lokasi || "",
        kapasitas: initialData.kapasitas || 0,
        deskripsi: initialData.deskripsi || "",
        kondisi: initialData.kondisi || "",
        status: initialData.status,
        image_files: []
      })
      setImagesToDelete([])
    }
  }, [initialData, form])

  const handleSubmit = async (data: FormData) => {
    try {
      const submitData = {
        ...data,
        imagesToDelete
      }
      await onSubmit(submitData)
      form.reset()
      setImagesToDelete([])
      onOpenChange(false)
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error("Error", {
        description: "Terjadi kesalahan saat menyimpan data",
      })
    }
  }

  // Filter out deleted images
  const remainingImages = existingImages.filter(url => !imagesToDelete.includes(url))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Prasarana" : "Tambah Prasarana"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Edit data prasarana yang sudah ada"
              : "Tambah data prasarana baru"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nama"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Masukkan nama prasarana" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lokasi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lokasi</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Masukkan lokasi prasarana" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="kapasitas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kapasitas</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      placeholder="Masukkan kapasitas prasarana"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="deskripsi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Masukkan deskripsi prasarana"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="kondisi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kondisi</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Masukkan kondisi prasarana" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status prasarana" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={StatusPeminjaman.TERSEDIA}>
                        Tersedia
                      </SelectItem>
                      <SelectItem value={StatusPeminjaman.DIPINJAM}>
                        Dipinjam
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Existing Images Section */}
            {remainingImages.length > 0 && (
              <div className="space-y-2">
                <FormLabel>Gambar Saat Ini</FormLabel>
                <div className="flex flex-wrap gap-4">
                  {remainingImages.map((url, index) => (
                    <div key={index} className="relative h-[200px] w-[200px]">
                      <Image
                        src={url}
                        alt="Preview"
                        fill
                        className="rounded-lg object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={() => setImagesToDelete(prev => [...prev, url])}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images Upload Section */}
            <FormField
              control={form.control}
              name="image_files"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tambah Gambar Baru</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={(files) => field.onChange(files)}
                      onRemove={() => field.onChange([])}
                      multiple
                      maxFiles={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 
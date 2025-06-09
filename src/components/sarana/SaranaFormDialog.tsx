"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, X, ImageIcon, PlusCircle, Pencil, Trash, Loader2 } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { JenisBarang, StatusSarpras } from "@prisma/client"
import * as z from "zod"

interface KategoriSarana {
  id: string
  nama: string
}

interface Satuan {
  id: string
  nama: string
  singkatan: string
}

interface DetailItem {
  id?: string
  nomer_seri: string
  status: StatusSarpras
  lokasi: string
}

interface SaranaFormData {
  nama: string
  kategoriId: string
  satuanId: string
  jenis: JenisBarang
  stok: number
  sisa: number
  lokasi: string
  image_url: string
  status: StatusSarpras
  detailItems: DetailItem[]
}

interface SaranaFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  data?: Partial<SaranaFormData>
  categories?: KategoriSarana[]
  units?: Satuan[]
  onSubmit: (data: any) => Promise<{ success: boolean; message: string; data: any | null }>
}

const DUMMY_CATEGORIES: KategoriSarana[] = []

export function SaranaFormDialog({
  open,
  onOpenChange,
  mode,
  data,
  categories = DUMMY_CATEGORIES,
  units = [],
  onSubmit
}: SaranaFormDialogProps) {
  const [activeTab, setActiveTab] = useState("info")
  const [formData, setFormData] = useState<SaranaFormData>({
    nama: "",
    kategoriId: "",
    satuanId: "",
    jenis: "TIDAK_BERNOMOR",
    stok: 0,
    sisa: 0,
    lokasi: "",
    image_url: "",
    status: "TERSEDIA",
    detailItems: []
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [newItem, setNewItem] = useState<DetailItem>({
    nomer_seri: "",
    status: "TERSEDIA",
    lokasi: ""
  })

  // Reset form when dialog is closed or mode changes
  useEffect(() => {
    if (!open) {
      setFormData({
        nama: "",
        kategoriId: "",
        satuanId: "",
        jenis: "TIDAK_BERNOMOR",
        stok: 0,
        sisa: 0,
        lokasi: "",
        image_url: "",
        status: "TERSEDIA",
        detailItems: []
      })
      setSelectedImage(null)
      setActiveTab("info")
    } else if (data) {
      setFormData({
        nama: data.nama || "",
        kategoriId: data.kategoriId || "",
        satuanId: data.satuanId || "",
        jenis: data.jenis || "TIDAK_BERNOMOR",
        stok: data.stok || 0,
        sisa: data.sisa || 0,
        lokasi: data.lokasi || "",
        image_url: data.image_url || "",
        status: data.status || "TERSEDIA",
        detailItems: data.detailItems || []
      })
    }
  }, [open, data])

  const handleInputChange = (field: keyof SaranaFormData, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      // Handle jenis change
      if (field === "jenis") {
        if (value === "BERNOMOR") {
          // Convert stok to detail items
          const items = Array.from({ length: prev.stok }, (_, i) => ({
            nomer_seri: `ITEM-${i + 1}`,
            status: "TERSEDIA" as StatusSarpras,
            lokasi: prev.lokasi || ""
          }))
          newData.detailItems = items
          newData.stok = items.length
          newData.sisa = items.length
        } else {
          // Convert detail items to stok
          newData.stok = prev.detailItems.length
          newData.sisa = prev.detailItems.filter(item => item.status === "TERSEDIA").length
          newData.detailItems = []
        }
      }
      
      return newData
    })
  }

  const handleImageUpload = (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Error", {
        description: "Mohon unggah file gambar",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Error", {
        description: "Ukuran gambar harus kurang dari 5MB",
      })
      return
    }

    setSelectedImage(file)
    const previewUrl = URL.createObjectURL(file)
    handleInputChange("image_url", previewUrl)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files?.[0]) {
      handleImageUpload(e.dataTransfer.files[0])
    }
  }

  const handleRemoveImage = () => {
    if (formData.image_url) {
      // Only revoke if it's a blob URL (preview)
      if (formData.image_url.startsWith('blob:')) {
        URL.revokeObjectURL(formData.image_url)
      }
      handleInputChange("image_url", "")
      setSelectedImage(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)
    
    try {
      // Prepare form data
      const formDataToSubmit = {
        nama: formData.nama,
        kategoriId: formData.kategoriId,
        satuanId: formData.satuanId,
        jenis: formData.jenis,
        stok: formData.stok,
        sisa: formData.sisa,
        lokasi: formData.lokasi,
        status: formData.status,
        image: selectedImage,
        detailSarana: formData.detailItems.map(item => ({
          nomer_seri: item.nomer_seri,
          status: item.status,
          lokasi: item.lokasi
        }))
      }
      
      // Submit form data
      const result = await onSubmit(formDataToSubmit)
      
      if (!result.success) {
        toast.error("Error", {
          description: result.message
        })
        return
      }
      
      // Reset form after successful submission
    setFormData({
      nama: "",
      kategoriId: "",
      satuanId: "",
      jenis: "TIDAK_BERNOMOR",
      stok: 0,
      sisa: 0,
      lokasi: "",
      image_url: "",
        status: "TERSEDIA",
      detailItems: []
    })
      setSelectedImage(null)
      setActiveTab("info")
      
      // Cleanup preview URL
      if (formData.image_url?.startsWith('blob:')) {
        URL.revokeObjectURL(formData.image_url)
      }

      // Close dialog
      onOpenChange(false)

      // Show success message
      toast.success("Sukses", {
        description: mode === "create" ? "Sarana berhasil ditambahkan" : "Sarana berhasil diupdate"
      })
    } catch (error: any) {
      console.error("Error submitting form:", error)
      
      // Handle validation errors
      if (error?.name === "ZodError") {
        const zodError = error as z.ZodError
        const errorMessages = zodError.errors.map(err => {
          const field = err.path.join('.')
          return `${field}: ${err.message}`
        }).join('\n')
        
        toast.error("Validasi Error", {
          description: errorMessages
        })
        return
      }
      
      // Handle other errors
      toast.error("Error", {
        description: error?.message || "Gagal menyimpan data sarana"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleAddItem = () => {
    if (newItem.nomer_seri && newItem.lokasi) {
      setFormData(prev => ({
        ...prev,
        detailItems: [...prev.detailItems, { ...newItem, id: Date.now().toString() }]
      }))
      setNewItem({
      nomer_seri: "",
        status: "TERSEDIA",
        lokasi: ""
      })
    }
  }

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      detailItems: prev.detailItems.filter((_, i) => i !== index)
    }))
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen && formData.image_url) {
        URL.revokeObjectURL(formData.image_url)
      }
      onOpenChange(isOpen)
    }}>
      <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[95vh] sm:max-h-[85vh] p-0 gap-0 overflow-auto">
        <div className="flex flex-col h-full">
          <DialogHeader className="p-4 sm:p-5 pb-0">
            <DialogTitle>
              {mode === "create" ? "Tambah Sarana" : "Edit Sarana"}
          </DialogTitle>
        </DialogHeader>

          <form onSubmit={handleSubmit} className="flex-1 overflow-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <div className="p-4 sm:p-5 border-y">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="info">Informasi Umum</TabsTrigger>
                  {formData.jenis === "BERNOMOR" && (
                    <TabsTrigger value="items">Detail Item</TabsTrigger>
                  )}
                </TabsList>
              </div>

              <div className="p-4 sm:p-5 space-y-6 overflow-auto">
                <TabsContent value="info" className="mt-0 space-y-6">
                  {/* Basic Info */}
                  <div className="bg-card rounded-lg border p-4">
                    <h3 className="text-sm font-semibold mb-4">Informasi Dasar</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="nama" className="text-xs font-medium">Nama Sarana *</Label>
                        <Input
                          id="nama"
                          value={formData.nama}
                          onChange={(e) => handleInputChange("nama", e.target.value)}
                          placeholder="Masukkan nama sarana"
                          className="mt-1"
                          required
                        />
                      </div>

                        <div>
                          <Label htmlFor="kategori" className="text-xs font-medium">Kategori *</Label>
                        <select
                          id="kategori"
                          value={formData.kategoriId}
                          onChange={(e) => handleInputChange("kategoriId", e.target.value)}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                          required
                        >
                          <option value="">Pilih Kategori</option>
                              {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                  {category.nama}
                            </option>
                            ))}
                        </select>
                        </div>

                        <div>
                          <Label htmlFor="satuan" className="text-xs font-medium">Satuan *</Label>
                        <select
                          id="satuan"
                          value={formData.satuanId}
                          onChange={(e) => handleInputChange("satuanId", e.target.value)}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                          required
                        >
                          <option value="">Pilih Satuan</option>
                              {units.map((unit) => (
                            <option key={unit.id} value={unit.id}>
                                  {unit.nama} ({unit.singkatan})
                            </option>
                            ))}
                        </select>
                </div>

                      <div>
                        <Label htmlFor="jenis" className="text-xs font-medium">Jenis Sarana *</Label>
                        <select
                          id="jenis"
                          value={formData.jenis}
                          onChange={(e) => handleInputChange("jenis", e.target.value as JenisBarang)}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                          required
                        >
                          <option value="TIDAK_BERNOMOR">Tidak Bernomor</option>
                          <option value="BERNOMOR">Bernomor</option>
                        </select>
                      </div>
                    </div>
                </div>

                  {/* Stock Info */}
                  {formData.jenis === "TIDAK_BERNOMOR" && (
                    <div className="bg-card rounded-lg border p-4">
                      <h3 className="text-sm font-semibold mb-4">Informasi Stok</h3>
                      <div>
                        <Label htmlFor="stok" className="text-xs font-medium">Total Stok *</Label>
                        <Input
                          id="stok"
                          type="number"
                          min="0"
                          value={formData.stok}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0
                            handleInputChange("stok", value)
                            handleInputChange("sisa", value)
                          }}
                          className="mt-1"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Location */}
                  <div className="bg-card rounded-lg border p-4">
                    <h3 className="text-sm font-semibold mb-4">Lokasi</h3>
                    <div>
                      <Label htmlFor="lokasi" className="text-xs font-medium">Lokasi Penyimpanan</Label>
                      <Input
                        id="lokasi"
                        value={formData.lokasi}
                        onChange={(e) => handleInputChange("lokasi", e.target.value)}
                        placeholder="Contoh: Ruang Lab Komputer, Gudang ATK"
                        className="mt-1"
                        />
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div className="bg-card rounded-lg border p-4">
                    <h3 className="text-sm font-semibold mb-4">Gambar Sarana</h3>
                    <div className="space-y-3">
                      {formData.image_url ? (
                        <div className="relative w-32 h-32 mx-auto">
                          <Image
                            src={formData.image_url}
                            alt="Preview"
                            fill
                            className="object-cover rounded-lg"
                          />
                      <Button
                        type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={handleRemoveImage}
                      >
                            <X className="h-3 w-3" />
                      </Button>
                        </div>
                      ) : (
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
                          onDrop={handleDrop}
                          onClick={() => document.getElementById("image-upload")?.click()}
                        >
                          <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mb-1">
                            Drag & drop gambar atau klik untuk upload
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG hingga 5MB
                          </p>
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleImageUpload(e.target.files[0])
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {formData.jenis === "BERNOMOR" && (
                  <TabsContent value="items" className="mt-0 space-y-6">
                    <div className="bg-card rounded-lg border p-4">
                      <h3 className="text-sm font-semibold mb-4">Detail Item</h3>
                        <div className="space-y-4">
                        <div className="grid grid-cols-12 gap-2">
                          <div className="col-span-5">
                                      <Input
                              placeholder="Nomor Seri"
                                value={newItem.nomer_seri}
                                onChange={(e) => setNewItem(prev => ({ ...prev, nomer_seri: e.target.value }))}
                              />
                            </div>
                          <div className="col-span-5">
                                      <Input
                              placeholder="Lokasi"
                                value={newItem.lokasi}
                                onChange={(e) => setNewItem(prev => ({ ...prev, lokasi: e.target.value }))}
                              />
                          </div>
                          <div className="col-span-2">
                            <Button
                              type="button"
                              className="w-full"
                              onClick={handleAddItem}
                              disabled={!newItem.nomer_seri || !newItem.lokasi}
                            >
                              <PlusCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {formData.detailItems.map((item, index) => (
                            <div
                              key={item.id || index}
                              className="flex items-center justify-between p-2 rounded-lg border"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{item.nomer_seri}</span>
                                  <Badge variant={item.status === "TERSEDIA" ? "default" : "secondary"}>
                                    {item.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{item.lokasi}</p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleRemoveItem(index)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                  </div>
                  </TabsContent>
                )}
              </div>
            </Tabs>
          </form>

          <div className="flex-shrink-0 flex justify-end gap-2 p-4 sm:p-5 pt-3 border-t">
              <Button
                type="button"
                variant="outline"
              onClick={() => {
                if (formData.image_url) {
                  URL.revokeObjectURL(formData.image_url)
                }
                onOpenChange(false)
              }}
              disabled={isUploading}
              >
                Batal
              </Button>
            <Button 
              type="submit"
              onClick={handleSubmit}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                mode === "create" ? "Tambah Sarana" : "Simpan Perubahan"
              )}
              </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
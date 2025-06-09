"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusSarpras } from "@prisma/client"
import { PlusIcon, Search, Eye, Pencil, Trash } from "lucide-react"
import { useState, useEffect } from "react"
import { SaranaDetailDialog } from "@/components/sarana/SaranaDetailDialog"
import { SaranaFormDialog } from "@/components/sarana/SaranaFormDialog"
import { DeleteConfirmDialog } from "@/components/sarana/DeleteConfirmDialog"
import { PrasaranaFormDialog } from "@/components/prasarana/PrasaranaFormDialog"
import { PrasaranaDeleteDialog } from "@/components/prasarana/PrasaranaDeleteDialog"
import { Carousel } from "@/components/ui/carousel"
import { useSarana } from "@/hooks/useSarana"
import { usePrasarana } from "@/hooks/usePrasarana"
import { useKategoriSatuan } from "@/hooks/useKategoriSatuan"
import { toast } from "sonner"

interface Satuan {
  id: string;
  nama: string;
  singkatan: string;
}

export default function ManajemenSarprasPage() {
  const [activeTab, setActiveTab] = useState("sarana")
  const [searchQuery, setSearchQuery] = useState("")
  const [kategoriFilter, setKategoriFilter] = useState("all")
  const [selectedSarana, setSelectedSarana] = useState<any>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [editData, setEditData] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<any>(null)
  const [prasaranaFormOpen, setPrasaranaFormOpen] = useState(false)
  const [prasaranaFormMode, setPrasaranaFormMode] = useState<"create" | "edit">("create")
  const [prasaranaEditData, setPrasaranaEditData] = useState<any>(null)
  const [prasaranaDeleteDialogOpen, setPrasaranaDeleteDialogOpen] = useState(false)
  const [prasaranaToDelete, setPrasaranaToDelete] = useState<any>(null)
  const [prasaranaStatusFilter, setPrasaranaStatusFilter] = useState<StatusSarpras | "all">("all")

  // Initialize hooks
  const { 
    data: saranaData,
    isLoading: isLoadingSarana,
    fetchData: fetchSarana,
    handleCreate: createSarana,
    handleUpdate: updateSarana,
    handleDelete: deleteSarana
  } = useSarana()

  const {
    data: prasaranaData,
    isLoading: isLoadingPrasarana,
    fetchData: fetchPrasarana,
    handleCreate: createPrasarana,
    handleUpdate: updatePrasarana,
    handleDelete: deletePrasarana
  } = usePrasarana()

  // Get kategori and satuan data
  const { 
    kategori: categories,
    satuan: units,
    isLoading: isLoadingOptions 
  } = useKategoriSatuan();

  // Initial data fetch
  useEffect(() => {
    fetchSarana({
      search: searchQuery,
      kategori: kategoriFilter !== "all" ? kategoriFilter : undefined,
    })
  }, [fetchSarana, searchQuery, kategoriFilter])

  useEffect(() => {
    if (activeTab === "prasarana") {
      fetchPrasarana({
        status: prasaranaStatusFilter === "all" ? undefined : prasaranaStatusFilter
      })
    }
  }, [activeTab, fetchPrasarana, prasaranaStatusFilter])

  const handleSubmitSarana = async (data: any) => {
    try {
      let result;
    if (formMode === "create") {
        result = await createSarana(data);
    } else {
        result = await updateSarana(editData?.id || "", data);
      }

      if (result.success) {
        setFormDialogOpen(false);
      }
      
      return {
        success: result.success,
        message: result.message,
        data: result.data || null
      };
    } catch (error) {
      return {
        success: false,
        message: "Gagal menyimpan data sarana",
        data: null
      };
    }
  };

  const handleEdit = (sarana: any) => {
    setFormMode("edit")
    setEditData({
      id: sarana.id,
      nama: sarana.nama,
      lokasi: sarana.lokasi ?? "",
      kategoriId: sarana.kategoriId,
      satuanId: sarana.satuanId,
      jenis: sarana.jenis,
      stok: sarana.stok,
      sisa: sarana.sisa,
      status: sarana.status,
      image_url: sarana.image_url,
      detailItems: sarana.detailSarana?.map((detail: any) => ({
        id: detail.id,
        nomer_seri: detail.nomer_seri,
        status: detail.status,
        lokasi: detail.lokasi
      })) ?? []
    })
    setFormDialogOpen(true)
  }

  const handleAdd = () => {
    setFormMode("create")
    setEditData(null)
    setFormDialogOpen(true)
  }

  const handleDelete = (sarana: any) => {
    setItemToDelete(sarana)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete?.id) return
    
    const success = await deleteSarana(itemToDelete.id)
    if (success) {
      setDeleteDialogOpen(false)
    setItemToDelete(null)
    }
  }

  const handleAddPrasarana = () => {
    setPrasaranaFormMode("create")
    setPrasaranaEditData(null)
    setPrasaranaFormOpen(true)
  }

  const handleEditPrasarana = (prasarana: any) => {
    setPrasaranaFormMode("edit")
    setPrasaranaEditData({
      id: prasarana.id,
      nama: prasarana.nama,
      lokasi: prasarana.lokasi ?? "",
      kapasitas: prasarana.kapasitas ?? 0,
      deskripsi: prasarana.deskripsi ?? "",
      status: prasarana.status,
      existingImages: prasarana.image_url
    })
    setPrasaranaFormOpen(true)
  }

  const handleSubmitPrasarana = async (data: any) => {
    try {
      console.log("[ManajemenSarpras] Submitting prasarana data:", {
        ...data,
        images: data.images?.map((f: File) => ({
          name: f.name,
          type: f.type,
          size: f.size
        }))
      });

    if (prasaranaFormMode === "create") {
        const success = await createPrasarana(data);
        if (success) {
          setPrasaranaFormOpen(false);
          toast.success("Prasarana berhasil dibuat");
        } else {
          toast.error("Gagal membuat prasarana");
        }
      } else {
        const success = await updatePrasarana(prasaranaEditData?.id || "", data);
        if (success) {
          setPrasaranaFormOpen(false);
          toast.success("Prasarana berhasil diupdate");
    } else {
          toast.error("Gagal mengupdate prasarana");
        }
      }
    } catch (error) {
      console.error("[ManajemenSarpras] Error submitting prasarana:", error);
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan prasarana");
    }
  }

  const handleDeletePrasarana = (prasarana: any) => {
    setPrasaranaToDelete(prasarana)
    setPrasaranaDeleteDialogOpen(true)
  }

  const handleConfirmDeletePrasarana = async () => {
    if (!prasaranaToDelete?.id) return
    
    const success = await deletePrasarana(prasaranaToDelete.id)
    if (success) {
      setPrasaranaDeleteDialogOpen(false)
      setPrasaranaToDelete(null)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Sarpras</h1>
          <p className="text-muted-foreground">
            Kelola data sarana dan prasarana sekolah
          </p>
        </div>

      {/* Main Content */}
        <Card className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="sarana">Sarana</TabsTrigger>
              <TabsTrigger value="prasarana">Prasarana</TabsTrigger>
            </TabsList>

          {/* Sarana Tab */}
          <TabsContent value="sarana" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                <h2 className="text-lg font-semibold">Daftar Sarana</h2>
                    <p className="text-sm text-muted-foreground">
                      Kelola data sarana seperti peralatan, perlengkapan, dan bahan pembelajaran
                    </p>
                  </div>
              <Button onClick={handleAdd}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Tambah Sarana
                  </Button>
                </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
              <div className="relative md:col-span-8">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari sarana..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
              <div className="md:col-span-4">
                <Select 
                  value={kategoriFilter} 
                  onValueChange={setKategoriFilter}
                  disabled={isLoadingOptions}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                  </div>
                </div>

            {/* Sarana Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">No</TableHead>
                    <TableHead>Nama Sarana</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Satuan</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead className="text-center">Stok</TableHead>
                    <TableHead className="text-center">Tersedia</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead className="w-[120px] text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {saranaData?.map((sarana, index) => (
                    <TableRow key={sarana.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="max-w-[200px]">
                        <span className="truncate block">{sarana.nama}</span>
                      </TableCell>
                      <TableCell className="max-w-[120px]">
                        <span className="truncate block">{sarana.kategoriSarana.nama}</span>
                      </TableCell>
                      <TableCell>{sarana.satuanSatuan.nama}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          sarana.jenis === "BERNOMOR" 
                            ? "bg-blue-50 text-blue-700" 
                            : "bg-green-50 text-green-700"
                        }`}>
                          {sarana.jenis === "BERNOMOR" ? "Bernomor" : "Tidak Bernomor"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {sarana.jenis === "BERNOMOR" 
                          ? (sarana.detailSarana || []).length
                          : sarana.stok} {sarana.satuanSatuan.nama}
                      </TableCell>
                      <TableCell className="text-center">
                        {sarana.jenis === "BERNOMOR"
                          ? (sarana.detailSarana || []).filter(d => d.status === "TERSEDIA").length
                          : sarana.sisa} {sarana.satuanSatuan.nama}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <span className="truncate block">{sarana.lokasi}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setSelectedSarana(sarana)
                              setDetailDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(sarana)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(sarana)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </TabsContent>

          {/* Prasarana Tab */}
          <TabsContent value="prasarana" className="space-y-6">
                <div className="flex items-center justify-between">
    <div>
                <h2 className="text-lg font-semibold">Daftar Prasarana</h2>
                    <p className="text-sm text-muted-foreground">
                      Kelola data prasarana seperti ruangan, gedung, dan lahan sekolah
                    </p>
                  </div>
              <Button onClick={handleAddPrasarana}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Tambah Prasarana
                  </Button>
                </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="relative md:col-span-8">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari prasarana..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="md:col-span-4">
                <Select 
                  value={prasaranaStatusFilter} 
                  onValueChange={(value: StatusSarpras | "all") => setPrasaranaStatusFilter(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="TERSEDIA">Tersedia</SelectItem>
                    <SelectItem value="DIPINJAM">Dipinjam</SelectItem>
                    <SelectItem value="RUSAK">Rusak</SelectItem>
                    <SelectItem value="HILANG">Hilang</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Prasarana Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {prasaranaData?.map((prasarana) => (
                <Card key={prasarana.id} className="overflow-hidden">
                  <Carousel 
                    images={prasarana.image_url.map(img => img.image_url)} 
                    aspectRatio="video"
                    className="w-full"
                    />
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold truncate">{prasarana.nama}</h3>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        prasarana.status === "TERSEDIA"
                          ? "bg-green-100 text-green-800"
                          : prasarana.status === "DIPINJAM"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {prasarana.status}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Lokasi</span>
                        <span className="font-medium max-w-[200px] truncate">{prasarana.lokasi}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Kapasitas</span>
                        <span className="font-medium">{prasarana.kapasitas} orang</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                        {prasarana.deskripsi}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleEditPrasarana(prasarana)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleDeletePrasarana(prasarana)}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Hapus
                    </Button>
                    </div>
                  </div>
                </Card>
                    ))}
                  </div>
            </TabsContent>
          </Tabs>
        </Card>

      {/* Detail Dialog */}
      <SaranaDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        data={selectedSarana}
      />

      {/* Form Dialog */}
      <SaranaFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        mode={formMode}
        data={editData}
        categories={categories}
        units={units}
        onSubmit={handleSubmitSarana}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Hapus Sarana"
        description={`Apakah Anda yakin ingin menghapus sarana "${itemToDelete?.nama}"? Tindakan ini tidak dapat dibatalkan.`}
      />

      {/* Prasarana Form Dialog */}
      <PrasaranaFormDialog
        open={prasaranaFormOpen}
        onOpenChange={setPrasaranaFormOpen}
        mode={prasaranaFormMode}
        data={prasaranaEditData}
        onSubmit={handleSubmitPrasarana}
      />

      {/* Add PrasaranaDeleteDialog */}
      <PrasaranaDeleteDialog
        open={prasaranaDeleteDialogOpen}
        onOpenChange={setPrasaranaDeleteDialogOpen}
        onConfirm={handleConfirmDeletePrasarana}
        nama={prasaranaToDelete?.nama || ""}
      />
    </div>
  )
}

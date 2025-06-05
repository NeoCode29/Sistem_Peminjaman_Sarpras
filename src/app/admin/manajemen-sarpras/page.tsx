"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SaranaDeleteDialog } from "@/components/sarana/SaranaDeleteDialog"
import { SaranaFormDialog } from "@/components/sarana/SaranaFormDialog"
import { SaranaInfoDialog } from "@/components/sarana/SaranaInfoDialog"
import { SaranaTable } from "@/components/sarana/SaranaTable"
import { SaranaSearch } from "@/components/sarana/SaranaSearch"
import { SaranaFilter } from "@/components/sarana/SaranaFilter"
import { useSaranaManagement } from "@/hooks/useSaranaManagement"
import { PlusIcon } from "lucide-react"
import { useEffect } from "react"
import { toast } from "sonner"

export default function ManajemenSarprasPage() {
  const {
    // States
    data,
    isLoading,
    selectedItem,
    pagination,
    filters,
    sort,
    dialogs,
    kategoriOptions,
    satuanOptions,

    // CRUD operations
    handleCreate,
    handleUpdate,
    handleDelete,

    // Dialog operations
    openDialog,
    closeDialog,

    // Data fetching
    fetchSarana,
    fetchOptions,

    // Pagination handlers
    handlePageChange,
    handleLimitChange,

    // Filter handlers
    handleSearch,
    handleKategoriFilter,

    // Sort handlers
    handleSort,
  } = useSaranaManagement()

  // Fetch initial data
  useEffect(() => {
    fetchSarana()
    fetchOptions()
  }, [fetchSarana, fetchOptions])

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Sarpras</h1>
          <p className="text-muted-foreground">
            Kelola data sarana dan prasarana sekolah
          </p>
        </div>

        <Card className="p-6">
          <Tabs defaultValue="sarana" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sarana">Sarana</TabsTrigger>
              <TabsTrigger value="prasarana">Prasarana</TabsTrigger>
            </TabsList>
            <TabsContent value="sarana" className="mt-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Daftar Sarana</h3>
                    <p className="text-sm text-muted-foreground">
                      Kelola data sarana seperti peralatan, perlengkapan, dan bahan pembelajaran
                    </p>
                  </div>
                  <Button onClick={() => openDialog("add")}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Tambah Sarana
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <SaranaSearch
                      onSearch={handleSearch}
                      placeholder="Cari nama sarana atau nomor seri..."
                    />
                  </div>
                  <div className="w-[200px]">
                    <SaranaFilter
                      options={kategoriOptions}
                      value={filters.kategori}
                      onValueChange={handleKategoriFilter}
                    />
                  </div>
                </div>

                <SaranaTable
                  data={data}
                  isLoading={isLoading}
                  pagination={pagination}
                  sort={sort}
                  onSort={handleSort}
                  onPageChange={handlePageChange}
                  onView={(item) => openDialog("info", item)}
                  onEdit={(item) => openDialog("edit", item)}
                  onDelete={(item) => openDialog("delete", item)}
                />
              </div>
            </TabsContent>
            <TabsContent value="prasarana" className="mt-6">
              <div className="flex flex-col gap-4">
    <div>
                  <h3 className="text-lg font-medium">Daftar Prasarana</h3>
                  <p className="text-sm text-muted-foreground">
                    Kelola data prasarana seperti ruangan, gedung, dan lahan sekolah
                  </p>
                </div>
                {/* Tambahkan komponen tabel prasarana di sini */}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Info Dialog */}
      <SaranaInfoDialog
        open={dialogs.info}
        onOpenChange={(open) => !open && closeDialog("info")}
        data={selectedItem}
      />

      {/* Add/Edit Dialog */}
      <SaranaFormDialog
        open={dialogs.add || dialogs.edit}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog(dialogs.add ? "add" : "edit")
          }
        }}
        onSubmit={async (data) => {
          try {
            if (dialogs.add) {
              await handleCreate(data)
              closeDialog("add")
              toast.success("Sukses", {
                description: "Sarana berhasil ditambahkan",
              })
            } else if (dialogs.edit && selectedItem) {
              await handleUpdate(selectedItem.id, data)
              closeDialog("edit")
              toast.success("Sukses", {
                description: "Sarana berhasil diperbarui",
              })
            }
            await fetchSarana()
          } catch (error) {
            console.error("Error submitting form:", error)
            toast.error("Error", {
              description: "Terjadi kesalahan saat menyimpan data",
            })
          }
        }}
        initialData={dialogs.edit && selectedItem ? {
          nama: selectedItem.nama,
          kategori: selectedItem.kategori,
          satuan: selectedItem.satuan,
          jenis: selectedItem.jenis,
          stok: selectedItem.stok,
          lokasi: selectedItem.lokasi || undefined,
          image_url: selectedItem.image_url || undefined,
          detailSarana: selectedItem.detailSarana.map(detail => ({
            nomer_seri: detail.nomer_seri || undefined,
            status: detail.status,
            lokasi: detail.lokasi || undefined,
          }))
        } : undefined}
        kategoriOptions={kategoriOptions}
        satuanOptions={satuanOptions}
      />

      {/* Delete Dialog */}
      <SaranaDeleteDialog
        open={dialogs.delete}
        onOpenChange={(open) => !open && closeDialog("delete")}
        onConfirm={async () => {
          if (selectedItem) {
            await handleDelete(selectedItem.id)
          }
        }}
        data={selectedItem}
      />
    </div>
  )
}

"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { SaranaWithRelations } from "@/service/saranaService"
import { JenisBarang, StatusPeminjaman } from "@prisma/client"
import { ArrowUpDown, Eye, Pencil, Trash } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface SaranaTableProps {
  data: SaranaWithRelations[]
  isLoading: boolean
  pagination: {
    page: number
    limit: number
    total: number
  }
  sort: {
    field: string
    direction: "asc" | "desc"
  }
  onSort: (field: string) => void
  onPageChange: (page: number) => void
  onView: (item: SaranaWithRelations) => void
  onEdit: (item: SaranaWithRelations) => void
  onDelete: (item: SaranaWithRelations) => void
}

export function SaranaTable({
  data,
  isLoading,
  pagination,
  sort,
  onSort,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: SaranaTableProps) {
  const totalPages = Math.ceil(pagination.total / pagination.limit)
  const currentPage = pagination.page

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    // Always show first page
    pages.push(1)

    if (currentPage > 3) {
      pages.push("ellipsis")
    }

    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i)
    }

    if (currentPage < totalPages - 2) {
      pages.push("ellipsis")
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages)
    }

    return pages
  }

  const renderSortIcon = (field: string) => {
    if (sort.field !== field) return <ArrowUpDown className="h-4 w-4" />
    return <ArrowUpDown className={`h-4 w-4 ${sort.direction === "desc" ? "rotate-180" : ""}`} />
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">No</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => onSort("nama")}
                    className="flex items-center gap-1"
                  >
                    Nama
                    <ArrowUpDown
                      className={`h-4 w-4 ${
                        sort.field === "nama"
                          ? "opacity-100"
                          : "opacity-50"
                      }`}
                    />
                  </Button>
                </TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Satuan</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Stok/Jumlah</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: pagination.limit }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-6 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[200px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] lg:w-[100px]">No</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => onSort("nama")}
                  className="flex items-center gap-1 hover:bg-accent/50"
                >
                  Nama
                  <ArrowUpDown
                    className={`h-4 w-4 transition-opacity ${
                      sort.field === "nama"
                        ? "opacity-100"
                        : "opacity-50"
                    }`}
                  />
                </Button>
              </TableHead>
              <TableHead className="hidden md:table-cell">Kategori</TableHead>
              <TableHead className="hidden lg:table-cell">Satuan</TableHead>
              <TableHead className="hidden sm:table-cell">Jenis</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => {
              const startNumber = (pagination.page - 1) * pagination.limit
              return (
                <TableRow key={item.id} className="group hover:bg-accent/5">
                  <TableCell className="font-medium">
                    {startNumber + index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.nama}
                          className="h-8 w-8 rounded-md object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium">{item.nama}</div>
                        <div className="text-sm text-muted-foreground md:hidden">
                          {item.kategoriSarana.nama}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {item.kategoriSarana.nama}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {item.satuanSatuan.nama}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      item.jenis === JenisBarang.BERNOMOR 
                        ? "bg-blue-50 text-blue-700" 
                        : "bg-green-50 text-green-700"
                    }`}>
                      {item.jenis === JenisBarang.BERNOMOR ? "Bernomor" : "Tidak Bernomor"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {item.jenis === JenisBarang.BERNOMOR 
                        ? item.detailSarana?.length || 0
                        : item.stok}
                    </span>
                    <span className="text-muted-foreground ml-1 hidden lg:inline">
                      {item.satuanSatuan.nama}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(item)}
                        className="h-8 w-8 opacity-70 hover:opacity-100"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(item)}
                        className="h-8 w-8 opacity-70 hover:opacity-100"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(item)}
                        className="h-8 w-8 text-destructive opacity-70 hover:opacity-100"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          Total {pagination.total} items
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <PaginationPrevious className="h-4 w-4" />
              </Button>
            </PaginationItem>
            {getPageNumbers().map((page, index) => (
              page === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={page}>
                  <Button
                    variant={page === currentPage ? "outline" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onPageChange(page)}
                  >
                    {page}
                  </Button>
                </PaginationItem>
              )
            ))}
            <PaginationItem>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <PaginationNext className="h-4 w-4" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
} 
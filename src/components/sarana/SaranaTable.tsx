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
      <div className="rounded-md border">
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
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: pagination.limit }).map((_, index) => (
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
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {(pagination.page - 1) * pagination.limit + index + 1}
                  </TableCell>
                  <TableCell>{item.nama}</TableCell>
                  <TableCell>{item.kategoriSarana.nama}</TableCell>
                  <TableCell>
                    {item.satuanSatuan.nama} ({item.satuanSatuan.singkatan})
                  </TableCell>
                  <TableCell>
                    {item.jenis === JenisBarang.BERNOMOR ? "Bernomor" : "Tidak Bernomor"}
                  </TableCell>
                  <TableCell>
                    {item.jenis === JenisBarang.BERNOMOR
                      ? `${item.detailSarana.length} item`
                      : `${item.stok} ${item.satuanSatuan.singkatan}`}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(item)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(item)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault()
                if (currentPage > 1) onPageChange(currentPage - 1)
              }}
            />
          </PaginationItem>

          {getPageNumbers().map((page, index) => (
            page === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  isActive={page === currentPage}
                  onClick={(e) => {
                    e.preventDefault()
                    onPageChange(page)
                  }}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          ))}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault()
                if (currentPage < totalPages) onPageChange(currentPage + 1)
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
} 
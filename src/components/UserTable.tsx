"use client"

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table"
import { User } from "@prisma/client"
import { ChevronLeft, ChevronRight } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface UserTableProps {
  data: User[]
  columns: ColumnDef<User>[]
  pageCount: number
  onSearch: (value: string) => void
  onRoleFilter: (role: string | null) => void
  onPositionFilter: (position: string | null) => void
  onPageChange: (page: number) => void
  currentPage: number
}

export function UserTable({
  data,
  columns,
  pageCount,
  onSearch,
  onRoleFilter,
  onPositionFilter,
  onPageChange,
  currentPage,
}: UserTableProps) {
  // Table states
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")

  // Initialize table
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  })

  // Handle search with debounce
  const debouncedSearch = React.useCallback(
    React.useMemo(
      () =>
        debounce((value: string) => {
          onSearch(value)
        }, 300),
      [onSearch]
    ),
    [onSearch]
  )

  // Handle role filter change
  const handleRoleFilterChange = (value: string) => {
    onRoleFilter(value === "all" ? null : value);
  };

  // Handle position filter change
  const handlePositionFilterChange = (value: string) => {
    onPositionFilter(value === "all" ? null : value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Pengguna</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            {/* Search */}
            <div className="flex-1">
              <Input
                placeholder="Cari pengguna..."
                value={globalFilter}
                onChange={(e) => {
                  setGlobalFilter(e.target.value)
                  debouncedSearch(e.target.value)
                }}
                className="max-w-sm"
              />
            </div>

            {/* Role Filter */}
            <Select onValueChange={handleRoleFilterChange}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter berdasarkan peran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Peran</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="PEMINJAM">Peminjam</SelectItem>
              </SelectContent>
            </Select>

            {/* Position Filter */}
            <Select onValueChange={handlePositionFilterChange}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter berdasarkan posisi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Posisi</SelectItem>
                <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                <SelectItem value="pegawai">Pegawai</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table with fixed height */}
          <div className="rounded-md border">
            <ScrollArea className="h-[500px]">
              <Table className="min-w-full">
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        Tidak ada data.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              Menampilkan {table.getRowModel().rows.length} dari {data.length} data
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                size="icon"
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Halaman sebelumnya</span>
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => onPageChange(page)}
                    className="h-8 w-8 p-0"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === pageCount}
                size="icon"
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Halaman selanjutnya</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Debounce helper function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
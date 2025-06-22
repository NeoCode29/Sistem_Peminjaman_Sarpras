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
import { ChevronLeft, ChevronRight, Search, Filter, Users } from "lucide-react"

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

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
  const [currentRoleFilter, setCurrentRoleFilter] = React.useState<string>("all")
  const [currentPositionFilter, setCurrentPositionFilter] = React.useState<string>("all")

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
  const debouncedSearch = React.useMemo(
    () =>
      debounce((value: string) => {
        onSearch(value)
      }, 300),
    [onSearch]
  )

  // Handle role filter change
  const handleRoleFilterChange = (value: string) => {
    setCurrentRoleFilter(value);
    onRoleFilter(value === "all" ? null : value);
  };

  // Handle position filter change
  const handlePositionFilterChange = (value: string) => {
    setCurrentPositionFilter(value);
    onPositionFilter(value === "all" ? null : value);
  };

  // Calculate active filters count
  const activeFiltersCount = [
    currentRoleFilter !== "all",
    currentPositionFilter !== "all",
    globalFilter.length > 0
  ].filter(Boolean).length;

  // Reset all filters
  const resetFilters = () => {
    setGlobalFilter("");
    setCurrentRoleFilter("all");
    setCurrentPositionFilter("all");
    onSearch("");
    onRoleFilter(null);
    onPositionFilter(null);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Daftar Pengguna
            </CardTitle>
            <CardDescription>
              Kelola dan pantau semua pengguna dalam sistem
            </CardDescription>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <span>{data.length} pengguna</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search and Filters Section */}
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama, email, atau nomor telepon..."
                value={globalFilter}
                onChange={(e) => {
                  setGlobalFilter(e.target.value)
                  debouncedSearch(e.target.value)
                }}
                className="pl-10 h-12"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filter:</span>
                </div>

                {/* Role Filter */}
                <Select value={currentRoleFilter} onValueChange={handleRoleFilterChange}>
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue placeholder="Peran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Peran</SelectItem>
                    <SelectItem value="ADMIN">Administrator</SelectItem>
                    <SelectItem value="PEMINJAM">Peminjam</SelectItem>
                  </SelectContent>
                </Select>

                {/* Position Filter */}
                <Select value={currentPositionFilter} onValueChange={handlePositionFilterChange}>
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue placeholder="Posisi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Posisi</SelectItem>
                    <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                    <SelectItem value="pegawai">Pegawai</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Active Filters and Reset */}
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <>
                    <Badge variant="outline" className="flex items-center gap-1">
                      {activeFiltersCount} filter aktif
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={resetFilters}
                      className="h-8 px-2 text-xs"
                    >
                      Reset
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Table with Horizontal Scroll for Mobile */}
          <div className="rounded-lg border bg-white">
            <div className="overflow-x-auto">
              <ScrollArea className="h-[500px] w-full">
                <Table className="min-w-[800px]">
                  <TableHeader className="bg-gray-50/50 sticky top-0 z-10">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id} className="hover:bg-gray-50/50">
                        {headerGroup.headers.map((header) => (
                          <TableHead 
                            key={header.id} 
                            className="font-semibold text-gray-900 border-b bg-gray-50/50"
                          >
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
                      table.getRowModel().rows.map((row, index) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                          className={`hover:bg-gray-50/50 transition-colors ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50/20"
                          }`}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell 
                              key={cell.id}
                              className="py-4 border-b border-gray-100"
                            >
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
                          className="h-32 text-center"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Users className="h-8 w-8 text-gray-400" />
                            <span className="text-gray-500">Tidak ada data pengguna</span>
                            <span className="text-sm text-gray-400">
                              Coba ubah filter pencarian Anda
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              Menampilkan <span className="font-medium">{data.length}</span> data
              {activeFiltersCount > 0 && (
                <span className="ml-1">
                  (dengan {activeFiltersCount} filter)
                </span>
              )}
            </div>
            
            {pageCount > 1 && (
              <div className="flex items-center justify-center sm:justify-end">
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Halaman sebelumnya</span>
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => {
                      let page: number;
                      const maxPages = 5;
                      
                      if (pageCount <= maxPages) {
                        page = i + 1;
                      } else if (currentPage <= Math.ceil(maxPages / 2)) {
                        page = i + 1;
                      } else if (currentPage >= pageCount - Math.floor(maxPages / 2)) {
                        page = pageCount - maxPages + 1 + i;
                      } else {
                        page = currentPage - Math.floor(maxPages / 2) + i;
                      }
                      
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          onClick={() => onPageChange(page)}
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === pageCount}
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Halaman selanjutnya</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Debounce helper function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { StatusPeminjaman } from "@prisma/client";
import { PeminjamanFilter } from "@/components/peminjaman/PeminjamanFilter";
import { PeminjamanList } from "@/components/peminjaman/PeminjamanList";
import { usePeminjamanAdmin } from "@/hooks/usePeminjamanAdmin";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PeminjamanClientProps {
  userId: string;
}

export function PeminjamanClient({ userId }: PeminjamanClientProps) {
  const {
    isLoading,
    error,
    getAllPeminjaman,
  } = usePeminjamanAdmin(userId);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusPeminjaman | "ALL">("ALL");
  const [dateFilter, setDateFilter] = useState<Date>();
  const [peminjaman, setPeminjaman] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    loadPeminjaman();
  }, [searchQuery, statusFilter, dateFilter, currentPage]);

  const loadPeminjaman = async () => {
    const result = await getAllPeminjaman({
      search: searchQuery,
      status: statusFilter === "ALL" ? undefined : statusFilter,
      startDate: dateFilter,
      endDate: dateFilter,
      page: currentPage,
      limit: itemsPerPage,
    });

    if (result && typeof result === 'object' && 'data' in result && 'total' in result) {
      const typedResult = result as { data: any[]; total: number };
      setPeminjaman(typedResult.data);
      setTotalItems(typedResult.total);
      setTotalPages(Math.ceil(typedResult.total / itemsPerPage));
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = () => {
    setCurrentPage(1); // Reset to first page when filter changes
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error: {error}</p>
            <Button onClick={loadPeminjaman} className="mt-4">
              Coba Lagi
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter Peminjaman</CardTitle>
        <CardDescription>
          Gunakan filter di bawah untuk mencari peminjaman tertentu
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <PeminjamanFilter
          searchQuery={searchQuery}
          onSearchChange={(query) => {
            setSearchQuery(query);
            handleFilterChange();
          }}
          statusFilter={statusFilter}
          onStatusChange={(status) => {
            setStatusFilter(status);
            handleFilterChange();
          }}
          dateFilter={dateFilter}
          onDateChange={(date) => {
            setDateFilter(date);
            handleFilterChange();
          }}
        />
        
        <PeminjamanList
          isLoading={isLoading}
          peminjaman={peminjaman}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>
                Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems} data
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Sebelumnya
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1"
              >
                Selanjutnya
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
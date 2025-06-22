"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { StatusPeminjaman } from "@prisma/client";
import { PeminjamanFilter } from "@/components/peminjaman/PeminjamanFilter";
import { PeminjamanList } from "@/components/peminjaman/PeminjamanList";
import { usePeminjamanAdmin } from "@/hooks/usePeminjamanAdmin";

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

  useEffect(() => {
    loadPeminjaman();
  }, [searchQuery, statusFilter, dateFilter]);

  const loadPeminjaman = async () => {
    const result = await getAllPeminjaman({
      search: searchQuery,
      status: statusFilter === "ALL" ? undefined : statusFilter,
      startDate: dateFilter,
      endDate: dateFilter,
      page: 1,
      limit: 10,
    });

    if (result && Array.isArray(result)) {
      setPeminjaman(result);
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
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
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          dateFilter={dateFilter}
          onDateChange={setDateFilter}
        />
        <PeminjamanList
          isLoading={isLoading}
          peminjaman={peminjaman}
        />
      </CardContent>
    </Card>
  );
} 
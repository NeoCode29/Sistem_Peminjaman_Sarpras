"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { StatusPeminjaman, UserRole } from "@prisma/client";
import { PeminjamanFilter } from "@/components/peminjaman/PeminjamanFilter";
import { PeminjamanList } from "@/components/peminjaman/PeminjamanList";
import PeminjamanDialog from "@/components/peminjaman/PeminjamanDialog";
import { usePeminjamanPeminjam } from "@/hooks/usePeminjamanPeminjam";
import { submitPengajuanAction } from "@/actions/peminjamanActions";
import { toast } from "sonner";

interface PeminjamanPeminjamClientProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    role: UserRole;
  };
}

export function PeminjamanPeminjamClient({ user }: PeminjamanPeminjamClientProps) {
  const [open, setOpen] = useState(false);
  const {
    isLoading,
    error,
    getPeminjamanList,
    createPeminjaman
  } = usePeminjamanPeminjam(user.id);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusPeminjaman | "ALL">("ALL");
  const [dateFilter, setDateFilter] = useState<Date>();
  const [peminjaman, setPeminjaman] = useState<any[]>([]);

  useEffect(() => {
    loadPeminjaman();
  }, [searchQuery, statusFilter, dateFilter]);

  const loadPeminjaman = async () => {
    const result = await getPeminjamanList({
      search: searchQuery || undefined,
      status: statusFilter === "ALL" ? undefined : statusFilter,
      startDate: dateFilter,
      endDate: dateFilter,
    });

    if (result) {
      setPeminjaman(result.data);
    }
  };

  const handleSubmitPeminjaman = async (formData: FormData) => {
    try {
  
      const result = await submitPengajuanAction(formData);
      
      if (result.error) {
        toast.error(result.error);
        return;
      }
      
      toast.success("Peminjaman berhasil dibuat");
      loadPeminjaman();
    } catch (error) {
      toast.error("Gagal membuat peminjaman");
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row justify-between">
          <div>
            <CardTitle>Filter Peminjaman</CardTitle>
            <CardDescription>
              Gunakan filter di bawah untuk mencari peminjaman tertentu
            </CardDescription>
          </div>
          <PeminjamanDialog 
            open={open}
            setOpen={setOpen}
            user={user}
            onSubmit={handleSubmitPeminjaman} 
          />
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
    </>
  );
} 
"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusPeminjaman } from "@prisma/client";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarIcon, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PeminjamanFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusPeminjaman | "ALL";
  onStatusChange: (value: StatusPeminjaman | "ALL") => void;
  dateFilter?: Date;
  onDateChange: (date?: Date) => void;
}

export function PeminjamanFilter({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  dateFilter,
  onDateChange,
}: PeminjamanFilterProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari berdasarkan nama acara..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select
        value={statusFilter}
        onValueChange={(value) => onStatusChange(value as StatusPeminjaman | "ALL")}
      >
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue placeholder="Filter Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Semua Status</SelectItem>
          <SelectItem value="DALAM_PROSES">Dalam Proses</SelectItem>
          <SelectItem value="DITERIMA">Diterima</SelectItem>
          <SelectItem value="DITOLAK">Ditolak</SelectItem>
          <SelectItem value="DIBATALKAN">Dibatalkan</SelectItem>
          <SelectItem value="SELESAI">Selesai</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full md:w-[240px] justify-start text-left font-normal",
                !dateFilter && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFilter ? (
                format(dateFilter, "dd MMMM yyyy", { locale: id })
              ) : (
                <span>Filter Tanggal Pengajuan</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateFilter}
              onSelect={onDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {dateFilter && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDateChange(undefined)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
} 
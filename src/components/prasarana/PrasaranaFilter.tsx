"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatusPeminjaman } from "@prisma/client"

interface PrasaranaFilterProps {
  value?: StatusPeminjaman
  onValueChange: (value: StatusPeminjaman) => void
}

export function PrasaranaFilter({ value, onValueChange }: PrasaranaFilterProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Filter Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={StatusPeminjaman.TERSEDIA}>Tersedia</SelectItem>
        <SelectItem value={StatusPeminjaman.DIPINJAM}>Dipinjam</SelectItem>
      </SelectContent>
    </Select>
  )
} 
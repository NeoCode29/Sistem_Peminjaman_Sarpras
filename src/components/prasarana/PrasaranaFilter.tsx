"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatusSarpras } from "@prisma/client"

interface PrasaranaFilterProps {
  value?: StatusSarpras
  onValueChange: (value: StatusSarpras) => void
}

export function PrasaranaFilter({ value, onValueChange }: PrasaranaFilterProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Filter Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={StatusSarpras.TERSEDIA}>Tersedia</SelectItem>
        <SelectItem value={StatusSarpras.DIPINJAM}>Dipinjam</SelectItem>
      </SelectContent>
    </Select>
  )
} 
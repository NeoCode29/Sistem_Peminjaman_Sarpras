"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SaranaFilterProps {
  options: Array<{ value: string; label: string }>
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
}

export function SaranaFilter({
  options,
  value,
  onValueChange,
  placeholder = "Filter kategori...",
}: SaranaFilterProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Semua Kategori</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 
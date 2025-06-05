"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface KategoriSelectProps {
  value?: string
  onValueChange?: (value: string) => void
  options: {
    value: string
    label: string
  }[]
  placeholder?: string
  disabled?: boolean
}

export function KategoriSelect({
  value,
  onValueChange,
  options,
  placeholder = "Pilih kategori",
  disabled = false,
}: KategoriSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 
"use client"

import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"
import { useCallback, useState } from "react"
import { useDebouncedCallback } from "use-debounce"

interface SaranaSearchProps {
  onSearch: (query: string) => void
  placeholder?: string
}

export function SaranaSearch({
  onSearch,
  placeholder = "Cari sarana...",
}: SaranaSearchProps) {
  const [value, setValue] = useState("")

  const debouncedSearch = useDebouncedCallback(
    (query: string) => {
      onSearch(query)
    },
    500
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setValue(newValue)
      debouncedSearch(newValue)
    },
    [debouncedSearch]
  )

  return (
    <div className="relative">
      <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  )
} 
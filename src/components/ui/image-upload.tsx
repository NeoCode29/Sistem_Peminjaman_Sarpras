import Image from "next/image"
import { CameraIcon, X } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  value: (File | string)[] | null
  onChange: (value: File[]) => void
  onRemove: () => void
  multiple?: boolean
  maxFiles?: number
  className?: string
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  multiple = false,
  maxFiles = 1,
  className,
}: ImageUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (multiple) {
      const totalFiles = (value?.filter(v => v instanceof File) || []).length + files.length
      if (maxFiles && totalFiles > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`)
        return
      }
      onChange([...files])
    } else {
      onChange([files[0]])
    }
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-wrap gap-4">
        {value?.map((file, index) => (
          <div key={index} className="relative h-[200px] w-[200px]">
            <Image
              src={file instanceof File ? URL.createObjectURL(file) : file}
              alt="Preview"
              fill
              className="rounded-lg object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2"
              onClick={() => {
                const newFiles = value.filter((_, i) => i !== index)
                newFiles.length === 0 ? onRemove() : onChange(newFiles.filter(f => f instanceof File) as File[])
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {(!maxFiles || (value?.length || 0) < maxFiles) && (
        <div className="flex items-center justify-center">
          <label
            htmlFor="image-upload"
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 p-4 hover:border-gray-400"
          >
            <CameraIcon className="h-6 w-6" />
            <span>Upload {multiple ? "Images" : "Image"}</span>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple={multiple}
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>
      )}
    </div>
  )
} 
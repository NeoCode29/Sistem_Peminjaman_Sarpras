"use client"

import { Button } from "@/components/ui/button"
import { uploadSaranaImage, deleteSaranaImage } from "@/actions/fileActions"
import { ImageIcon, Loader2, TrashIcon, UploadIcon } from "lucide-react"
import Image from "next/image"
import { useCallback, useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  value?: string
  onChange?: (url: string) => void
  onRemove?: () => void
  disabled?: boolean
  className?: string
  aspectRatio?: "square" | "video" | "portrait"
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled,
  className,
  aspectRatio = "square",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = useCallback(
    async (file: File) => {
      try {
        setIsUploading(true)

        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.error("Error", {
            description: "Mohon unggah file gambar",
          })
          return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error("Error", {
            description: "Ukuran gambar harus kurang dari 5MB",
          })
          return
        }

        // Upload to Google Drive sarana folder
        const url = await uploadSaranaImage(file)

        if (url && onChange) {
          onChange(url)
          toast.success("Sukses", {
            description: "Gambar berhasil diunggah",
          })
        }
      } catch (error) {
        console.error("Error uploading image:", error)
        toast.error("Error", {
          description: "Gagal mengunggah gambar",
        })
      } finally {
        setIsUploading(false)
      }
    },
    [onChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      if (disabled) return

      const file = e.dataTransfer.files[0]
      if (file) {
        handleUpload(file)
      }
    },
    [disabled, handleUpload]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return

      const file = e.target.files?.[0]
      if (file) {
        handleUpload(file)
      }
    },
    [disabled, handleUpload]
  )

  const handleRemove = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.stopPropagation()

      if (disabled) return

      try {
        if (value && onRemove) {
          await deleteSaranaImage(value)
          onRemove()
          toast.success("Sukses", {
            description: "Gambar berhasil dihapus",
          })
        }
      } catch (error) {
        console.error("Error removing image:", error)
        toast.error("Error", {
          description: "Gagal menghapus gambar",
        })
      }
    },
    [disabled, onRemove, value]
  )

  const aspectRatioClass = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
  }

  return (
    <div
      onClick={() => document.getElementById("imageUpload")?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className={cn(
        "relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed transition-colors hover:bg-accent/5",
        className
      )}
    >
      <input
        id="imageUpload"
        type="file"
        accept="image/*"
        onChange={handleChange}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {value ? (
        // Image preview
        <div className={cn(
          "relative w-full overflow-hidden rounded-lg",
          aspectRatioClass[aspectRatio]
        )}>
          <Image
            src={value}
            alt="Upload preview"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity hover:opacity-100">
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2"
              onClick={handleRemove}
              disabled={disabled || isUploading}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : isUploading ? (
        // Loading state
        <div className="flex flex-col items-center gap-2 p-4">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Mengunggah gambar...
          </p>
        </div>
      ) : (
        // Upload prompt
        <div className="flex flex-col items-center gap-2 p-4">
          <div className="rounded-full bg-accent/10 p-4">
            <UploadIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">
            Klik atau seret & lepas untuk mengunggah
          </p>
          <p className="text-xs text-muted-foreground">
            Ukuran file maksimal: 5MB
          </p>
        </div>
      )}
    </div>
  )
} 
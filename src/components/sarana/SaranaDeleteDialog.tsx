"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { SaranaWithRelations } from "@/service/saranaService"

interface SaranaDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  data?: SaranaWithRelations
}

export function SaranaDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  data,
}: SaranaDeleteDialogProps) {
  if (!data) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Sarana</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus sarana &quot;{data.nama}&quot;?
            Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data
            terkait termasuk gambar yang telah diunggah.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Hapus</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 
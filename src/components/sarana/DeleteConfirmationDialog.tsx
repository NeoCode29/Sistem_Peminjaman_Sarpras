"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SaranaWithRelations } from "@/service/saranaService"

interface DeleteConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  data?: SaranaWithRelations
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  data,
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus Sarana</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus sarana &quot;{data?.nama}&quot;? Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 
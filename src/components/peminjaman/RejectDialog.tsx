"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

interface RejectDialogProps {
  title: string;
  description: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (message: string) => void;
  message: string;
  onMessageChange: (message: string) => void;
  confirmText?: string;
  cancelText?: string;
}

export function RejectDialog({
  title,
  description,
  open,
  onOpenChange,
  onConfirm,
  message,
  onMessageChange,
  confirmText = "Ya, Tolak",
  cancelText = "Tidak, Kembali"
}: RejectDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Textarea
          placeholder="Alasan penolakan..."
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          className="mt-4"
        />
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(message)}
            className="bg-destructive hover:bg-destructive/90"
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 
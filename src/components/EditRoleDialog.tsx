"use client";

import * as React from "react";
import { User, UserRole } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface EditRoleDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (userId: string, newRole: UserRole) => Promise<boolean>;
}

export function EditRoleDialog({
  user,
  isOpen,
  onClose,
  onUpdate,
}: EditRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(
    user?.role || null
  );
  const [isLoading, setIsLoading] = useState(false);

  // Reset selected role when user changes
  React.useEffect(() => {
    setSelectedRole(user?.role || null);
  }, [user]);

  const handleUpdate = async () => {
    if (!user || !selectedRole) return;

    setIsLoading(true);
    try {
      const success = await onUpdate(user.id, selectedRole);
      if (success) {
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ubah Peran Pengguna</DialogTitle>
          <DialogDescription>
            Ubah peran untuk pengguna {user?.name || "yang dipilih"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Select
            value={selectedRole || undefined}
            onValueChange={(value) => setSelectedRole(value as UserRole)}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih peran baru" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">Administrator</SelectItem>
              <SelectItem value="PEMINJAM">Peminjam</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isLoading}
            className="sm:w-24"
          >
            Batal
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={!selectedRole || selectedRole === user?.role || isLoading}
            className="sm:w-24"
          >
            {isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
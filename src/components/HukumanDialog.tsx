"use client";

import React, { useState, useEffect } from "react";
import { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { applyHukuman, cancelHukuman } from "@/actions/userManagementActions";
import { getHariHukumanDefault } from "@/actions/settingActions";

/**
 * Dialog component for managing user punishments
 * Used by: Admin
 * Purpose: Allow administrators to apply or cancel user punishments with configurable duration and reason
 */
interface HukumanDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

/**
 * HukumanDialog Component
 * Used by: Admin
 * Purpose: Modal dialog for punishment management with current status display and action buttons
 * Features: Shows current punishment status, allows setting punishment duration/reason, cancel punishment
 * Workflow: Fetch settings -> Display status -> Apply/Cancel punishment -> Update parent component
 */
export function HukumanDialog({
  user,
  isOpen,
  onClose,
  onUpdate,
}: HukumanDialogProps) {
  const [hariHukuman, setHariHukuman] = useState<number>(7);
  const [alasanHukuman, setAlasanHukuman] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [pengaturanHari, setPengaturanHari] = useState<number>(7);
  const { data: session } = useSession();

  // Fetch pengaturan hari hukuman using action
  useEffect(() => {
    const fetchPengaturan = async () => {
      try {
        const response = await getHariHukumanDefault();
        if (response.success && response.data) {
          setPengaturanHari(response.data);
          setHariHukuman(response.data);
        } else {
          // Fallback to default if error
          setPengaturanHari(7);
          setHariHukuman(7);
        }
      } catch (error) {
        console.error('Error fetching punishment settings:', error);
        // Fallback to default
        setPengaturanHari(7);
        setHariHukuman(7);
      }
    };

    if (isOpen) {
      fetchPengaturan();
    }
  }, [isOpen]);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setAlasanHukuman("");
      setHariHukuman(pengaturanHari);
    }
  }, [isOpen, pengaturanHari]);

  const isUserBlocked = user?.due_blocked && new Date(user.due_blocked) > new Date();
  const blockedUntil = user?.due_blocked ? new Date(user.due_blocked) : null;

  const handleBeriHukuman = async () => {
    if (!user || !alasanHukuman.trim()) {
      toast.error("Alasan hukuman harus diisi");
      return;
    }

    if (!session?.user?.id) {
      toast.error("Session tidak valid");
      return;
    }

    setIsLoading(true);
    try {
      const response = await applyHukuman(session.user.id, {
        userId: user.id,
        hariHukuman,
        alasan: alasanHukuman,
      });

      if (response.success) {
        toast.success(response.message);
        onUpdate();
        onClose();
      } else {
        toast.error(response.message || "Gagal memberikan hukuman");
      }
    } catch (error) {
      console.error('Error applying punishment:', error);
      toast.error("Terjadi kesalahan saat memberikan hukuman");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatalkanHukuman = async () => {
    if (!user) return;

    if (!session?.user?.id) {
      toast.error("Session tidak valid");
      return;
    }

    setIsLoading(true);
    try {
      const response = await cancelHukuman(session.user.id, user.id);

      if (response.success) {
        toast.success(response.message);
        onUpdate();
        onClose();
      } else {
        toast.error(response.message || "Gagal membatalkan hukuman");
      }
    } catch (error) {
      console.error('Error canceling punishment:', error);
      toast.error("Terjadi kesalahan saat membatalkan hukuman");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDaysRemaining = () => {
    if (!blockedUntil) return 0;
    const today = new Date();
    const diffTime = blockedUntil.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Kelola Hukuman Pengguna
          </DialogTitle>
          <DialogDescription>
            Kelola status hukuman untuk pengguna {user?.name || "yang dipilih"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Hukuman Saat Ini */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Status Hukuman Saat Ini</CardTitle>
            </CardHeader>
            <CardContent>
              {isUserBlocked ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Sedang Dihukum
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>Berakhir: {blockedUntil && formatDate(blockedUntil)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>Sisa: {calculateDaysRemaining()} hari</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Tidak Ada Hukuman
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Beri Hukuman */}
          {!isUserBlocked && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Berikan Hukuman</CardTitle>
                <CardDescription>
                  Berikan hukuman kepada pengguna yang melanggar aturan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hariHukuman">Lama Hukuman (Hari)</Label>
                  <Input
                    id="hariHukuman"
                    type="number"
                    value={hariHukuman}
                    onChange={(e) => setHariHukuman(parseInt(e.target.value) || 0)}
                    min={1}
                    max={365}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Default: {pengaturanHari} hari (sesuai pengaturan)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alasanHukuman">Alasan Hukuman *</Label>
                  <Textarea
                    id="alasanHukuman"
                    value={alasanHukuman}
                    onChange={(e) => setAlasanHukuman(e.target.value)}
                    placeholder="Masukkan alasan pemberian hukuman..."
                    rows={3}
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Tutup
          </Button>
          
          {isUserBlocked ? (
            <Button 
              variant="destructive" 
              onClick={handleBatalkanHukuman}
              disabled={isLoading}
            >
              {isLoading ? "Membatalkan..." : "Batalkan Hukuman"}
            </Button>
          ) : (
            <Button 
              onClick={handleBeriHukuman}
              disabled={isLoading || !alasanHukuman.trim()}
            >
              {isLoading ? "Memberikan..." : "Beri Hukuman"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
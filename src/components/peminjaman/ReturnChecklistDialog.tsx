"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ChevronDown, ChevronRight } from "lucide-react";
import { PeminjamanWithItems } from "@/service/peminjamanService";
import { isReturnAllowed, formatReturnDate } from "@/lib/utils/dateUtils";

interface ReturnChecklistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  peminjaman: PeminjamanWithItems;
  onSubmit: (checklist: {
    prasaranaIds?: string[];
    saranaItems?: { saranaId: string; jumlah?: number; detailItems?: string[] }[];
  }) => Promise<void>;
}

export function ReturnChecklistDialog({
  open,
  onOpenChange,
  peminjaman,
  onSubmit,
}: ReturnChecklistDialogProps) {
  const [selectedPrasarana, setSelectedPrasarana] = useState<string[]>([]);
  const [selectedSarana, setSelectedSarana] = useState<string[]>([]);
  const [saranaDetailItems, setSaranaDetailItems] = useState<Record<string, string[]>>({});
  const [expandedSarana, setExpandedSarana] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if return is allowed - should be allowed after pickup
  const hasPickedUpItems = peminjaman.status_pengambilan === "SUDAH_MENGAMBIL";
  const returnAllowed = hasPickedUpItems;

  // Initialize state based on existing return data
  useEffect(() => {
    if (open && peminjaman) {
      // For prasarana - only show if picked up but allow re-checking if not validated
      const returnablePrasarana = peminjaman.peminjamanPrasarana
        .filter(item => item.sudah_ambil && (peminjaman.status_pengembalian !== "SUDAH_MENGEMBALIKAN"))
        .map(item => item.prasaranaId);
      
      // If already returned but not validated, pre-select them
      const alreadyReturnedPrasarana = peminjaman.peminjamanPrasarana
        .filter(item => item.sudah_kembali && peminjaman.status_pengembalian === "MENUNGGU_VALIDASI")
        .map(item => item.prasaranaId);
      
      setSelectedPrasarana(alreadyReturnedPrasarana);

      // For sarana - similar logic
      const alreadyReturnedSarana = peminjaman.peminjamanSarana
        .filter(item => item.sudah_kembali && peminjaman.status_pengembalian === "MENUNGGU_VALIDASI")
        .map(item => item.saranaId);
      
      // Only select sarana that have already been returned before (for editing mode)
      // Don't auto-select items just because they've been picked up - let user choose
      setSelectedSarana(alreadyReturnedSarana);

      // Initialize detail items for BERNOMOR sarana
      const detailItems: Record<string, string[]> = {};
      const expandedState: Record<string, boolean> = {};
      peminjaman.peminjamanSarana.forEach(item => {
        if (item.sarana?.jenis === "BERNOMOR" && item.peminjamanSaranaDetail?.length > 0) {
          // Pre-select items that are already marked as returned
          const returnedDetails = item.peminjamanSaranaDetail
            .filter(detail => detail.sudah_kembali)
            .map(detail => detail.nama_barang);
          detailItems[item.saranaId] = returnedDetails;
          
          // Auto-expand if there are returned details
          expandedState[item.saranaId] = returnedDetails.length > 0;
        }
      });
      setSaranaDetailItems(detailItems);
      setExpandedSarana(expandedState);
    }
  }, [open, peminjaman]);

  const handlePrasaranaToggle = (prasaranaId: string) => {
    setSelectedPrasarana(prev => 
      prev.includes(prasaranaId)
        ? prev.filter(id => id !== prasaranaId)
        : [...prev, prasaranaId]
    );
  };

  const handleSaranaToggle = (saranaId: string) => {
    const item = peminjaman.peminjamanSarana.find(s => s.saranaId === saranaId);
    const isBernomor = item?.sarana?.jenis === "BERNOMOR";
    const hasDetailItems = item?.peminjamanSaranaDetail && item.peminjamanSaranaDetail.length > 0;
    
    // For BERNOMOR items, check if all detail items are selected
    if (isBernomor && hasDetailItems) {
      const selectedDetailItems = saranaDetailItems[saranaId] || [];
      const totalDetailItems = item.peminjamanSaranaDetail.length;

      // Only allow checking if all detail items are selected
      if (selectedDetailItems.length !== totalDetailItems) {
        return; // Don't allow toggle if not all detail items are selected
      }
    }
    
    setSelectedSarana(prev => 
      prev.includes(saranaId)
        ? prev.filter(id => id !== saranaId)
        : [...prev, saranaId]
    );
  };

  const handleDetailItemToggle = (saranaId: string, detailName: string) => {
    setSaranaDetailItems(prev => {
      const currentItems = prev[saranaId] || [];
      const isSelected = currentItems.includes(detailName);
      
      const newItems = {
        ...prev,
        [saranaId]: isSelected 
          ? currentItems.filter(name => name !== detailName)
          : [...currentItems, detailName]
      };
      
      // Auto-select/deselect parent sarana based on detail items
      const item = peminjaman.peminjamanSarana.find(s => s.saranaId === saranaId);
      if (item?.peminjamanSaranaDetail) {
        const totalDetailItems = item.peminjamanSaranaDetail.length;
        const selectedDetailItems = newItems[saranaId] || [];
        
        // If all detail items are selected, auto-select parent
        if (selectedDetailItems.length === totalDetailItems) {
          setSelectedSarana(prev => 
            prev.includes(saranaId) ? prev : [...prev, saranaId]
          );
        } else {
          // If not all detail items are selected, auto-deselect parent
          setSelectedSarana(prev => prev.filter(id => id !== saranaId));
        }
      }
      
      return newItems;
    });
  };

  const toggleSaranaExpanded = (saranaId: string) => {
    setExpandedSarana(prev => ({
      ...prev,
      [saranaId]: !prev[saranaId]
    }));
  };

  // Helper function to check if sarana can be selected
  const canSelectSarana = (saranaId: string) => {
    const item = peminjaman.peminjamanSarana.find(s => s.saranaId === saranaId);
    const isBernomor = item?.sarana?.jenis === "BERNOMOR";
    const hasDetailItems = item?.peminjamanSaranaDetail && item.peminjamanSaranaDetail.length > 0;
    
    if (!isBernomor || !hasDetailItems) {
      return true; // Non-BERNOMOR items can always be selected
    }
    
    const selectedDetailItems = saranaDetailItems[saranaId] || [];
    const totalDetailItems = item.peminjamanSaranaDetail.length;
    
    return selectedDetailItems.length === totalDetailItems;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const checklist = {
        prasaranaIds: selectedPrasarana,
        saranaItems: selectedSarana.map(saranaId => {
          const item = peminjaman.peminjamanSarana.find(s => s.saranaId === saranaId);
          return {
          saranaId,
            jumlah: item?.jumlah || 0, // Use original quantity, no modification allowed
          detailItems: saranaDetailItems[saranaId] || []
          };
        }).filter(item => item.saranaId && item.jumlah > 0)
      };
      
      await onSubmit(checklist);
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting return checklist:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter items that have been picked up and can be returned
  const canReturnPrasarana = peminjaman.peminjamanPrasarana.filter(item => 
    item.sudah_ambil && peminjaman.status_pengembalian !== "SUDAH_MENGEMBALIKAN"
  );
  const canReturnSarana = peminjaman.peminjamanSarana.filter(item => 
    item.sudah_ambil && peminjaman.status_pengembalian !== "SUDAH_MENGEMBALIKAN"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Checklist Pengembalian Barang
          </DialogTitle>
          <DialogDescription>
            {!returnAllowed && (
              <span className="text-amber-600 font-medium mb-2 block">
                ⚠️ Checklist pengembalian hanya dapat dilakukan setelah Anda melakukan pengambilan barang.
              </span>
            )}
            Pilih item yang akan dikembalikan. Untuk sarana bernomor, pilih semua sub item terlebih dahulu. Pastikan semua barang dalam kondisi baik sebelum mengembalikan.
            {peminjaman.status_pengembalian === "MENUNGGU_VALIDASI" && (
              <span className="text-orange-600 font-medium"> Anda dapat mengubah checklist ini sampai admin memvalidasi pengembalian.</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Daftar Item Pengembalian</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(canReturnPrasarana.length > 0 || canReturnSarana.length > 0) ? (
                <div className="space-y-4">
                  {/* Prasarana Items */}
                  {canReturnPrasarana.map((item) => (
                    <div key={`prasarana-${item.id}`} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                      <Checkbox
                        id={`prasarana-${item.id}`}
                        checked={selectedPrasarana.includes(item.prasaranaId)}
                        onCheckedChange={() => handlePrasaranaToggle(item.prasaranaId)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-1">
                        <Label htmlFor={`prasarana-${item.id}`} className="font-medium cursor-pointer">
                          {item.prasarana.nama}
                        </Label>
                        <p className="text-sm text-muted-foreground">Prasarana</p>
                      </div>
                    </div>
                  ))}

                  {/* Sarana Items */}
                  {canReturnSarana.map((item) => {
                    const selectedDetailItems = saranaDetailItems[item.saranaId] || [];
                    const isBernomor = item.sarana?.jenis === "BERNOMOR";
                    const hasDetailItems = item.peminjamanSaranaDetail && item.peminjamanSaranaDetail.length > 0;
                    const canSelect = canSelectSarana(item.saranaId);
                    const isExpanded = expandedSarana[item.saranaId];

                    if (isBernomor && hasDetailItems) {
                      // Render as Accordion for BERNOMOR items
                    return (
                      <div key={`sarana-${item.id}`} className="border rounded-lg overflow-hidden">
                          {/* Parent Sarana with Accordion Trigger */}
                          <div 
                            className="flex items-start space-x-3 p-4 hover:bg-gray-50 cursor-pointer"
                            onClick={() => toggleSaranaExpanded(item.saranaId)}
                          >
                            <div className="flex items-center space-x-3">
                          <Checkbox
                            id={`sarana-${item.id}`}
                            checked={selectedSarana.includes(item.saranaId)}
                            onCheckedChange={() => handleSaranaToggle(item.saranaId)}
                                disabled={!canSelect}
                                className="mt-1"
                                onClick={(e) => e.stopPropagation()}
                          />
                              <div className="flex items-center space-x-2">
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                )}
                              </div>
                            </div>
                            <div className="flex-1 space-y-1">
                            <Label htmlFor={`sarana-${item.id}`} className="font-medium cursor-pointer">
                              {item.sarana?.nama || 'Sarana Tidak Diketahui'}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Jumlah: {item.jumlah} {item.sarana?.satuanSatuan?.singkatan || 'unit'}
                                <span className="ml-2">• {selectedDetailItems.length}/{item.peminjamanSaranaDetail.length} item dipilih</span>
                                {!canSelect && (
                                  <span className="ml-2 text-amber-600">• Pilih semua sub item terlebih dahulu</span>
                              )}
                            </p>
                          </div>
                        </div>

                          {/* Detail Items */}
                          {isExpanded && (
                          <div className="border-t bg-gray-50/50">
                            <div className="p-4">
                                <h5 className="text-sm font-medium mb-3 text-muted-foreground">Detail Nomor Seri:</h5>
                              <div className="space-y-2">
                                {item.peminjamanSaranaDetail.map((detail, detailIndex) => (
                                    <div key={`detail-${detail.id || detailIndex}`} className="flex items-center space-x-3 p-3 bg-white rounded border">
                                    <Checkbox
                                      id={`detail-${detail.id}`}
                                      checked={selectedDetailItems.includes(detail.nama_barang)}
                                      onCheckedChange={() => handleDetailItemToggle(item.saranaId, detail.nama_barang)}
                                    />
                                    <div className="flex-1">
                                      <Label htmlFor={`detail-${detail.id}`} className="text-sm font-medium cursor-pointer">
                                        {detail.nama_barang || `Item ${detailIndex + 1}`}
                                      </Label>
                                    </div>
                                    </div>
                                  ))}
                                  </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    } else {
                      // Render as regular item for non-BERNOMOR items
                      return (
                        <div key={`sarana-${item.id}`} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                          <Checkbox
                            id={`sarana-${item.id}`}
                            checked={selectedSarana.includes(item.saranaId)}
                            onCheckedChange={() => handleSaranaToggle(item.saranaId)}
                            className="mt-1"
                          />
                          <div className="flex-1 space-y-1">
                            <Label htmlFor={`sarana-${item.id}`} className="font-medium cursor-pointer">
                              {item.sarana?.nama || 'Sarana Tidak Diketahui'}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Jumlah: {item.jumlah} {item.sarana?.satuanSatuan?.singkatan || 'unit'}
                            </p>
                          </div>
                      </div>
                    );
                    }
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Tidak ada item yang dapat dikembalikan</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !returnAllowed || (
              selectedPrasarana.length === 0 && 
              selectedSarana.length === 0
            )}
          >
            {isSubmitting ? "Menyimpan..." : 
             !returnAllowed ? "Harus mengambil barang terlebih dahulu" :
             "Simpan Checklist Pengembalian"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
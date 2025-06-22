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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Plus, Minus, Trash2, ChevronDown, ChevronRight, Check, X } from "lucide-react";
import { PeminjamanWithItems } from "@/service/peminjamanService";
import { getAvailableSaranaForPickupAction } from "@/actions/saranaActions";

interface DetailSarana {
  id: string;
  nomer_seri: string | null;
  status: string;
  lokasi: string | null;
}

interface SaranaWithDetails {
  id: string;
  nama: string;
  jenis: string;
  sisa: number;
  status: string;
  satuanSatuan: {
    nama: string;
    singkatan: string;
  };
  kategoriSarana: {
    nama: string;
  };
  detailSarana: DetailSarana[];
}

interface SaranaItem {
  id: string;
  saranaId: string;
  nama: string;
  jenis: string;
  jumlah: number;
  maxJumlah: number;
  selectedSerials: string[];
  expanded: boolean;
  isAdditional: boolean;
}

interface PickupChecklistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  peminjaman: PeminjamanWithItems;
  onSubmit: (checklist: {
    saranaItems?: { saranaId: string; jumlah: number; detailItems?: string[]; customSerials?: string[]; selectedSerials?: string[] }[];
  }) => Promise<void>;
}

export function PickupChecklistDialog({
  open,
  onOpenChange,
  peminjaman,
  onSubmit,
}: PickupChecklistDialogProps) {
  const [saranaItems, setSaranaItems] = useState<SaranaItem[]>([]);
  const [availableSarana, setAvailableSarana] = useState<SaranaWithDetails[]>([]);
  const [selectedNewSaranaId, setSelectedNewSaranaId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize state
  useEffect(() => {
    if (open && peminjaman) {
      // Initialize sarana items with default unchecked state
      const initialSaranaItems: SaranaItem[] = peminjaman.peminjamanSarana.map(item => {
        // Start with empty state - nothing pre-selected
        return {
          id: `original-${item.id}`,
          saranaId: item.saranaId,
          nama: item.sarana.nama,
          jenis: item.sarana.jenis,
          jumlah: 0, // Default: nothing selected initially
          maxJumlah: item.jumlah,
          selectedSerials: [], // Default: no serials selected initially
          expanded: false,
          isAdditional: false
        };
      });

      setSaranaItems(initialSaranaItems);
    }
  }, [open, peminjaman]);

  // Fetch available sarana
  useEffect(() => {
    const fetchAvailableSarana = async () => {
      const result = await getAvailableSaranaForPickupAction();
      if (result.success && result.data) {
        const existingSaranaIds = peminjaman.peminjamanSarana.map(item => item.saranaId);
        const filteredSarana = result.data.filter(sarana => !existingSaranaIds.includes(sarana.id));
        setAvailableSarana(filteredSarana);
      }
    };
    
    if (open) {
      fetchAvailableSarana();
    }
  }, [open, peminjaman]);



  const handleSaranaQuantityChange = (itemId: string, newQuantity: number) => {
    setSaranaItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      
      const quantity = Math.max(0, Math.min(newQuantity, item.maxJumlah));
      
      // Adjust selected serials if quantity decreased
      let selectedSerials = item.selectedSerials;
      if (item.jenis === "BERNOMOR" && selectedSerials.length > quantity) {
        selectedSerials = selectedSerials.slice(0, quantity);
      }
      
      return {
        ...item,
        jumlah: quantity,
        selectedSerials
      };
    }));
  };

  const toggleSaranaExpanded = (itemId: string) => {
    setSaranaItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, expanded: !item.expanded } : item
    ));
  };

  const handleAddSerial = (itemId: string, serial: string) => {
    if (!serial.trim()) return;
    
    setSaranaItems(prev => prev.map(item => {
      if (item.id !== itemId || item.selectedSerials.includes(serial.trim()) || 
          item.selectedSerials.length >= item.jumlah) return item;
      return { ...item, selectedSerials: [...item.selectedSerials, serial.trim()] };
    }));
  };

  const handleRemoveSerial = (itemId: string, serial: string) => {
    setSaranaItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      return { ...item, selectedSerials: item.selectedSerials.filter(s => s !== serial) };
    }));
  };

  const handleAddNewSarana = () => {
    const sarana = availableSarana.find(s => s.id === selectedNewSaranaId);
    if (!sarana) return;

    const newItem: SaranaItem = {
      id: `additional-${Date.now()}`,
      saranaId: sarana.id,
      nama: sarana.nama,
      jenis: sarana.jenis,
      jumlah: 0, // Default: start unchecked for both BERNOMOR and non-BERNOMOR
      maxJumlah: sarana.jenis === "BERNOMOR" ? sarana.detailSarana.length : sarana.sisa,
      selectedSerials: [],
      expanded: false,
      isAdditional: true
    };

    setSaranaItems(prev => [...prev, newItem]);
    setSelectedNewSaranaId("");
  };

  const handleRemoveSarana = (itemId: string) => {
    setSaranaItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Check if a BERNOMOR sarana is complete (all required serials selected)
  const isSaranaComplete = (item: SaranaItem) => {
    if (item.jenis !== "BERNOMOR") return item.jumlah > 0;
    return item.selectedSerials.length === item.jumlah && item.jumlah > 0;
  };

    const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const saranaItemsData = saranaItems
        .filter(item => item.jumlah > 0)
        .map(item => ({
            saranaId: item.saranaId,
            jumlah: item.jumlah,
          detailItems: item.jenis === "BERNOMOR" ? item.selectedSerials : undefined,
          customSerials: item.jenis === "BERNOMOR" ? item.selectedSerials : undefined,
          selectedSerials: item.jenis === "BERNOMOR" ? item.selectedSerials : undefined
        }));

      await onSubmit({ saranaItems: saranaItemsData });
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting checklist:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Checklist Pengambilan Barang
          </DialogTitle>
          <DialogDescription>
            Pilih item yang akan diambil. Untuk sarana bernomor, tentukan jumlah lalu pilih nomor seri.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Main Checklist */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Daftar Item</CardTitle>
            </CardHeader>
                        <CardContent className="space-y-3">
              {/* Sarana Items */}
              {saranaItems.map((item) => {
                const saranaData = item.isAdditional 
                  ? availableSarana.find(s => s.id === item.saranaId)
                  : peminjaman.peminjamanSarana.find(ps => ps.saranaId === item.saranaId)?.sarana;
                
                const isComplete = isSaranaComplete(item);
                const isBernomor = item.jenis === "BERNOMOR";

                return (
                  <div key={item.id} className={`border rounded-lg ${isBernomor && !isComplete ? 'border-orange-300 bg-orange-50' : ''}`}>
                    {/* Parent Sarana Row */}
                    <div className="flex items-center space-x-3 p-3">
                      <Checkbox
                        checked={isComplete}
                        disabled={isBernomor}
                        onCheckedChange={() => {
                          if (!isBernomor) {
                            handleSaranaQuantityChange(item.id, isComplete ? 0 : 1);
                          }
                        }}
                      />
                      
                      <div className="flex-1">
                        <Label className="cursor-pointer font-medium">
                          {item.nama}
                          {item.isAdditional && <Badge variant="secondary" className="ml-2 text-xs">Tambahan</Badge>}
                          {isBernomor && !isComplete && item.jumlah > 0 && (
                            <Badge variant="outline" className="ml-2 text-xs text-orange-600 border-orange-300">
                              Perlu pilih nomor seri
                            </Badge>
                          )}
                        </Label>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleSaranaQuantityChange(item.id, item.jumlah - 1)}
                          disabled={item.jumlah <= 0}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={item.jumlah}
                          onChange={(e) => handleSaranaQuantityChange(item.id, parseInt(e.target.value) || 0)}
                          className="w-16 h-7 text-center text-sm"
                          min={0}
                          max={item.maxJumlah}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleSaranaQuantityChange(item.id, item.jumlah + 1)}
                          disabled={item.jumlah >= item.maxJumlah}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <span className="text-xs text-muted-foreground">/{item.maxJumlah}</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1">
                        {isBernomor && item.jumlah > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSaranaExpanded(item.id)}
                            className="h-7 w-7 p-0"
                          >
                            {item.expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                          </Button>
                        )}
                        
                        {item.isAdditional && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveSarana(item.id)}
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Serial Selection Accordion */}
                    {isBernomor && item.expanded && item.jumlah > 0 && (
                      <div className="px-3 pb-3">
                        <div className="p-3 bg-gray-50 rounded border space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Nomor Seri ({item.selectedSerials.length}/{item.jumlah})</Label>
                            {isComplete && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                <Check className="h-3 w-3 mr-1" />Lengkap
                              </Badge>
                            )}
                          </div>

                          {/* Select dropdown untuk memilih nomor seri */}
                          <div className="space-y-2">
                            <Select
                              value=""
                              onValueChange={(value) => {
                                console.log('Select onChange triggered with value:', value);
                                if (value && value !== 'no-data' && value !== 'all-selected') {
                                  handleAddSerial(item.id, value);
                                }
                              }}
                              disabled={item.selectedSerials.length >= item.jumlah}
                            >
                              <SelectTrigger className="w-full h-8">
                                <SelectValue placeholder={
                                  item.selectedSerials.length >= item.jumlah 
                                    ? "Sudah mencapai batas maksimal" 
                                    : "Pilih nomor seri dari database"
                                } />
                              </SelectTrigger>
                              <SelectContent>
                                {(() => {
                                  console.log('=== SELECT CONTENT RENDER ===');
                                  console.log('saranaData:', saranaData);
                                  console.log('item:', item);
                                  
                                  // Try multiple ways to get detail sarana
                                  let detailSarana = [];
                                  
                                  if (item.isAdditional) {
                                    // For additional items, get from availableSarana
                                    const foundSarana = availableSarana.find(s => s.id === item.saranaId);
                                    detailSarana = foundSarana?.detailSarana || [];
                                    console.log('Additional item - foundSarana:', foundSarana);
                                  } else {
                                    // For original items, get from peminjaman data
                                    const peminjamanSaranaItem = peminjaman.peminjamanSarana.find(ps => ps.saranaId === item.saranaId);
                                    detailSarana = peminjamanSaranaItem?.sarana?.detailSarana || [];
                                    console.log('Original item - peminjamanSaranaItem:', peminjamanSaranaItem);
                                    console.log('Original item - sarana:', peminjamanSaranaItem?.sarana);
                                  }
                                  
                                  console.log('Final detailSarana:', detailSarana);
                                  
                                  if (!detailSarana || detailSarana.length === 0) {
                                    return [
                                      <SelectItem key="no-data" value="no-data" disabled>
                                        ❌ Tidak ada nomor seri di database untuk {item.nama}
                                      </SelectItem>
                                    ];
                                  }
                                  
                                  // Filter available serials
                                  const availableSerials = detailSarana.filter(detail => {
                                    const serialValue = detail.nomer_seri || detail.id;
                                    const isNotSelected = !item.selectedSerials.includes(serialValue);
                                    const isAvailable = detail.status === "TERSEDIA";
                                    console.log(`Checking serial ${serialValue}:`, { isNotSelected, isAvailable, status: detail.status });
                                    return isNotSelected && isAvailable;
                                  });
                                  
                                  console.log('Final availableSerials:', availableSerials);
                                  
                                  if (availableSerials.length === 0) {
                                    const allSerials = detailSarana.map(d => `${d.nomer_seri || d.id} (${d.status})`).join(', ');
                                    return [
                                      <SelectItem key="all-selected" value="all-selected" disabled>
                                        ⚠️ Tidak ada nomor seri TERSEDIA. Semua: [{allSerials}]
                                      </SelectItem>
                                    ];
                                  }
                                  
                                  return availableSerials.map((detail) => (
                                    <SelectItem key={detail.id} value={detail.nomer_seri || detail.id}>
                                      {detail.nomer_seri || `Item-${detail.id.slice(-6)}`}
                                      {detail.lokasi && ` (📍 ${detail.lokasi})`}
                                      {detail.status && ` - ${detail.status}`}
                                    </SelectItem>
                                  ));
                                })()}
                              </SelectContent>
                            </Select>
                                                      </div>

                          {/* Daftar Nomor Seri yang Sudah Dipilih */}
                          {item.selectedSerials.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium text-gray-700">
                                  Nomor Seri Terpilih ({item.selectedSerials.length}/{item.jumlah}):
                                </Label>
                                {item.selectedSerials.length === item.jumlah && (
                                  <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                                    <Check className="h-3 w-3 mr-1" />
                                    Lengkap
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                                {item.selectedSerials.map((serial, index) => (
                                  <div 
                                    key={`${item.id}-serial-${index}`} 
                                    className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded text-sm"
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                      <span className="font-medium text-blue-800">
                                        {serial}
                                      </span>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveSerial(item.id, serial)}
                                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                      title={`Hapus ${serial}`}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                              
                              {item.selectedSerials.length < item.jumlah && (
                                <div className="text-xs text-muted-foreground text-center py-1">
                                  💡 Masih perlu memilih {item.jumlah - item.selectedSerials.length} nomor seri lagi
                                </div>
                              )}
                            </div>
                          )}

                          {/* Pesan jika belum ada yang dipilih */}
                          {item.selectedSerials.length === 0 && item.jumlah > 0 && (
                            <div className="text-center py-4 text-muted-foreground">
                              <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">Belum ada nomor seri yang dipilih</p>
                              <p className="text-xs">Pilih {item.jumlah} nomor seri dari dropdown di atas</p>
                            </div>
                          )}




                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Add New Sarana */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tambah Sarana</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Select value={selectedNewSaranaId} onValueChange={setSelectedNewSaranaId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Pilih sarana untuk ditambahkan" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSarana
                      .filter(sarana => !saranaItems.some(item => item.saranaId === sarana.id))
                      .map((sarana) => (
                        <SelectItem key={sarana.id} value={sarana.id}>
                          {sarana.nama} - {sarana.jenis === "BERNOMOR" 
                            ? `${sarana.detailSarana.length} unit` 
                            : `${sarana.sisa} ${sarana.satuanSatuan.singkatan}`
                          } tersedia
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  onClick={handleAddNewSarana}
                  disabled={!selectedNewSaranaId}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || saranaItems.filter(item => item.jumlah > 0).length === 0}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Checklist"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  Search, 
  Plus, 
  Minus, 
  X, 
  Package, 
  AlertCircle, 
  CheckCircle, 
  ShoppingCart,
  Filter
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SaranaOption {
  id: string;
  nama: string;
  jenis: string;
  sisa: number;
  status: string;
  satuanSatuan: {
    nama: string;
    singkatan: string;
  };
}

interface SelectedSarana {
  id: string;
  nama: string;
  jumlah: number;
}

interface ImprovedSaranaSelectionProps {
  availableSarana: SaranaOption[];
  selectedSarana: SelectedSarana[];
  onAddSarana: (sarana: SaranaOption) => void;
  onRemoveSarana: (id: string) => void;
  onUpdateJumlah: (id: string, jumlah: number) => void;
  onClearAll: () => void;
}

export function ImprovedSaranaSelection({
  availableSarana,
  selectedSarana,
  onAddSarana,
  onRemoveSarana,
  onUpdateJumlah,
  onClearAll
}: ImprovedSaranaSelectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterJenis, setFilterJenis] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("nama");

  // Filter and sort available sarana
  const filteredSarana = availableSarana
    .filter(sarana => 
      !selectedSarana.some(selected => selected.id === sarana.id) &&
      sarana.nama.toLowerCase().includes(searchQuery.toLowerCase()) &&
      sarana.sisa > 0 &&
      (filterJenis === "all" || sarana.jenis === filterJenis)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "nama":
          return a.nama.localeCompare(b.nama);
        case "stok":
          return b.sisa - a.sisa;
        case "jenis":
          return a.jenis.localeCompare(b.jenis);
        default:
          return 0;
      }
    });

  const uniqueJenis = Array.from(new Set(availableSarana.map(s => s.jenis)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium flex items-center gap-2">
          <Package className="h-4 w-4" />
          Pilih Sarana
        </Label>
        <Badge variant="outline" className="text-xs">
          {selectedSarana.length} item dipilih
        </Badge>
      </div>

      {/* Search and Filter Controls */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari sarana berdasarkan nama..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterJenis} onValueChange={setFilterJenis}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue placeholder="Jenis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                {uniqueJenis.map(jenis => (
                  <SelectItem key={jenis} value={jenis}>
                    {jenis}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nama">Nama</SelectItem>
              <SelectItem value="stok">Stok</SelectItem>
              <SelectItem value="jenis">Jenis</SelectItem>
            </SelectContent>
          </Select>

          {(searchQuery || filterJenis !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setFilterJenis("all");
              }}
              className="h-8"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Available Sarana Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm text-muted-foreground">
            Sarana Tersedia ({filteredSarana.length})
          </Label>
          {selectedSarana.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAll}
              className="text-destructive hover:text-destructive h-7"
            >
              <X className="h-3 w-3 mr-1" />
              Hapus Semua
            </Button>
          )}
        </div>

        <div className="grid gap-3 max-h-80 overflow-y-auto border rounded-lg p-3 bg-muted/20">
          {filteredSarana.length > 0 ? (
            filteredSarana.map((sarana) => (
              <Card 
                key={`available-sarana-${sarana.id}`} 
                className="p-3 hover:bg-muted/50 transition-all duration-200 cursor-pointer border-dashed hover:border-solid hover:shadow-sm"
                onClick={() => {
                  onAddSarana(sarana);
                  setSearchQuery("");
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{sarana.nama}</h4>
                      <Badge 
                        variant={sarana.sisa > 10 ? "default" : sarana.sisa > 5 ? "secondary" : "destructive"}
                        className="text-xs"
                      >
                        {sarana.sisa} {sarana.satuanSatuan.singkatan}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        Jenis: {sarana.jenis}
                      </p>
                      <span className="text-xs text-muted-foreground">•</span>
                      <p className="text-xs text-muted-foreground">
                        Status: {sarana.status}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 shrink-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {searchQuery || filterJenis !== "all" 
                  ? "Tidak ada sarana yang sesuai dengan filter" 
                  : "Semua sarana sudah dipilih atau tidak tersedia"
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Selected Sarana */}
      {selectedSarana.length > 0 && (
        <div className="space-y-4">
          <Label className="text-base font-medium flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Sarana yang Dipilih
          </Label>
          
          <div className="grid gap-3">
            {selectedSarana.map((item, index) => {
              const saranaDetail = availableSarana.find(s => s.id === item.id);
              const isOverLimit = item.jumlah > (saranaDetail?.sisa || 0);
              
              return (
                <Card key={`selected-sarana-${item.id}-${index}`} className="p-4 transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{item.nama}</h4>
                        <Badge variant="secondary" className="text-xs">
                          Stok: {saranaDetail?.sisa} {saranaDetail?.satuanSatuan.singkatan}
                        </Badge>
                        {isOverLimit && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Melebihi stok
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`jumlah-${item.id}`} className="text-sm whitespace-nowrap">
                            Jumlah:
                          </Label>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => onUpdateJumlah(item.id, Math.max(1, item.jumlah - 1))}
                              disabled={item.jumlah <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              id={`jumlah-${item.id}`}
                              type="number"
                              value={item.jumlah}
                              onChange={(e) => {
                                const value = Math.max(1, parseInt(e.target.value) || 1);
                                onUpdateJumlah(item.id, value);
                              }}
                              min={1}
                              max={saranaDetail?.sisa || 1}
                              className={cn(
                                "w-20 h-8 text-center",
                                isOverLimit && "border-destructive focus:border-destructive"
                              )}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => onUpdateJumlah(item.id, item.jumlah + 1)}
                              disabled={item.jumlah >= (saranaDetail?.sisa || 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {saranaDetail?.satuanSatuan.singkatan}
                          </span>
                        </div>
                      </div>
                      
                      {isOverLimit && (
                        <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Jumlah yang diminta melebihi stok yang tersedia
                        </p>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => onRemoveSarana(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
          
          {/* Summary */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">Ringkasan Peminjaman</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-blue-700">Total Jenis:</span>
                  <span className="font-bold text-blue-900">{selectedSarana.length} item</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-700">Total Quantity:</span>
                  <span className="font-bold text-blue-900">
                    {selectedSarana.reduce((total, item) => total + item.jumlah, 0)} unit
                  </span>
                </div>
              </div>
              
              {/* Validation warning */}
              {selectedSarana.some(item => {
                const saranaDetail = availableSarana.find(s => s.id === item.id);
                return item.jumlah > (saranaDetail?.sisa || 0);
              }) && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-xs text-red-700 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Beberapa item melebihi stok yang tersedia. Harap sesuaikan jumlah sebelum melanjutkan.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 
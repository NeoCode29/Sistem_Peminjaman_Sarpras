"use client";

import { useState, useEffect, useCallback } from "react";
import { format, startOfDay, endOfDay } from "date-fns";
import { id } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GoogleDriveImage } from "@/components/ui/google-drive-image";
import { Carousel } from "@/components/ui/carousel";
import { Package, Building, Search, Eye, MapPin, Users, Calendar as CalendarIcon, Filter, RefreshCw, AlertTriangle, CheckCircle, Clock, ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Import server actions
import { 
  checkSaranaAvailabilityAction, 
  checkPrasaranaAvailabilityAction,
  getSaranaWithCategoriesAction,
  getPrasaranaAction,
  getCategoriesAction
} from "@/actions/availabilityActions";

interface Sarana {
  id: string;
  nama: string;
  lokasi?: string | null;
  status: string;
  stok: number;
  sisa: number;
  jenis: string;
  image_url?: string | null;
  kategoriSarana?: {
    id: string;
    nama: string;
  } | null;
  satuanSatuan?: {
    nama: string;
    singkatan: string;
  } | null;
  // Dynamic availability based on date
  availableStock?: number;
  bookedStock?: number;
  isAvailable?: boolean;
}

interface Prasarana {
  id: string;
  nama: string;
  deskripsi?: string | null;
  status: string;
  kapasitas?: number | null;
  lokasi?: string | null;
  image_url?: Array<{
    id: string;
    image_url: string;
  }>;
  // Dynamic availability based on date
  isAvailable?: boolean;
  bookedDates?: string[];
  nextAvailableDate?: string | null;
}

interface AvailabilityFilter {
  selectedDate: Date;
  category: string;
  availability: 'all' | 'available' | 'unavailable';
}

export function ImprovedDaftarSarpras() {
  const [saranaList, setSaranaList] = useState<Sarana[]>([]);
  const [prasaranaList, setPrasaranaList] = useState<Prasarana[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<Sarana | Prasarana | null>(null);
  const [selectedType, setSelectedType] = useState<'sarana' | 'prasarana'>('sarana');
  const [activeTab, setActiveTab] = useState("sarana");
  const [categories, setCategories] = useState<Array<{id: string, nama: string}>>([]);
  
  const [filters, setFilters] = useState<AvailabilityFilter>({
    selectedDate: new Date(),
    category: 'all',
    availability: 'all'
  });

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (filters.selectedDate) {
      checkAvailability();
    }
  }, [filters.selectedDate, saranaList.length, prasaranaList.length]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [saranaResponse, prasaranaResponse] = await Promise.all([
        getSaranaWithCategoriesAction(),
        getPrasaranaAction()
      ]);

      if (saranaResponse.success && saranaResponse.data) {
        setSaranaList(saranaResponse.data as Sarana[]);
      } else {
        toast.error(saranaResponse.error || 'Gagal memuat data sarana');
      }

      if (prasaranaResponse.success && prasaranaResponse.data) {
        setPrasaranaList(prasaranaResponse.data as Prasarana[]);
      } else {
        toast.error(prasaranaResponse.error || 'Gagal memuat data prasarana');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data sarpras');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategoriesAction();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const checkAvailability = async () => {
    if (!filters.selectedDate) return;
    
    setRefreshing(true);
    try {
      const startDate = startOfDay(filters.selectedDate).toISOString();
      const endDate = endOfDay(filters.selectedDate).toISOString();

      const [saranaAvailabilityResponse, prasaranaAvailabilityResponse] = await Promise.all([
        checkSaranaAvailabilityAction(startDate, endDate),
        checkPrasaranaAvailabilityAction(startDate, endDate)
      ]);

      // Update sarana with availability info
      if (saranaAvailabilityResponse.success && saranaAvailabilityResponse.data) {
        setSaranaList(prev => prev.map(sarana => {
          const availability = saranaAvailabilityResponse.data!.find(a => a.id === sarana.id);
          if (availability) {
            return {
              ...sarana,
              availableStock: availability.availableStock,
              bookedStock: availability.bookedStock,
              isAvailable: availability.isAvailable
            };
          }
          return {
            ...sarana,
            availableStock: sarana.sisa,
            bookedStock: 0,
            isAvailable: sarana.sisa > 0
          };
        }));
      }

      // Update prasarana with availability info
      if (prasaranaAvailabilityResponse.success && prasaranaAvailabilityResponse.data) {
        setPrasaranaList(prev => prev.map(prasarana => {
          const availability = prasaranaAvailabilityResponse.data!.find(a => a.id === prasarana.id);
          if (availability) {
            return {
              ...prasarana,
              isAvailable: availability.isAvailable,
              bookedDates: availability.bookedDates.map(date => date.start),
              nextAvailableDate: availability.nextAvailableDate
            };
          }
          return {
            ...prasarana,
            isAvailable: true,
            bookedDates: [],
            nextAvailableDate: undefined
          };
        }));
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      toast.error('Gagal memeriksa ketersediaan');
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
    if (filters.selectedDate) {
      checkAvailability();
    }
  };

  const filterSarana = (items: Sarana[]): Sarana[] => {
    return items.filter(item => {
      const matchesSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kategoriSarana?.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.lokasi?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = filters.category === 'all' || item.kategoriSarana?.id === filters.category;
      
      const matchesAvailability = filters.availability === 'all' || 
        (filters.availability === 'available' && (item.availableStock ?? item.sisa) > 0) ||
        (filters.availability === 'unavailable' && (item.availableStock ?? item.sisa) === 0);

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  };

  const filterPrasarana = (items: Prasarana[]): Prasarana[] => {
    return items.filter(item => {
      const matchesSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.lokasi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.deskripsi?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesAvailability = filters.availability === 'all' || 
        (filters.availability === 'available' && item.isAvailable) ||
        (filters.availability === 'unavailable' && !item.isAvailable);

      return matchesSearch && matchesAvailability;
    });
  };

  const filteredSarana = filterSarana(saranaList);
  const filteredPrasarana = filterPrasarana(prasaranaList);

  const handleItemClick = (item: Sarana | Prasarana, type: 'sarana' | 'prasarana') => {
    setSelectedItem(item);
    setSelectedType(type);
  };

  const getStockPercentage = (sarana: Sarana): number => {
    return sarana.stok > 0 ? ((sarana.availableStock ?? sarana.sisa) / sarana.stok) * 100 : 0;
  };

  const getStockColor = (percentage: number): string => {
    if (percentage > 50) return 'bg-emerald-500';
    if (percentage > 20) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getAvailabilityBadge = (item: Sarana | Prasarana, type: 'sarana' | 'prasarana') => {
    if (type === 'sarana') {
      const sarana = item as Sarana;
      const available = sarana.availableStock ?? sarana.sisa;
      if (available > 0) {
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Tersedia
          </Badge>
        );
      } else {
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Habis
          </Badge>
        );
      }
    } else {
      const prasarana = item as Prasarana;
      if (prasarana.isAvailable) {
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Tersedia
          </Badge>
        );
      } else {
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">
            <Clock className="w-3 h-3 mr-1" />
            Dipinjam
          </Badge>
        );
      }
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "destructive" | "secondary" => {
    switch (status) {
      case "TERSEDIA": return "default";
      case "RUSAK": case "HILANG": return "destructive";
      default: return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Filter Bar - Improved Navigator */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-md">
                <Filter className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Filter & Pencarian</h3>
                <p className="text-sm text-gray-500">Gunakan filter untuk mempersempit pencarian sarpras</p>
              </div>
            </div>
            <Button 
              onClick={handleRefresh} 
              disabled={refreshing} 
              variant="outline" 
              size="sm"
              className="border-gray-300 hover:bg-gray-50"
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
              {refreshing ? 'Memuat...' : 'Refresh'}
            </Button>
      </div>

          {/* Filter Controls */}
          <div className="space-y-6">
            {/* Primary Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Pencarian Umum
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari nama sarana/prasarana, kategori, atau lokasi ruangan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>

                         {/* Filter Grid - Match Card Layout */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date Picker */}
            <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                   <CalendarIcon className="w-4 h-4" />
                   Tanggal Kebutuhan
                 </label>
              <Popover>
                <PopoverTrigger asChild>
                     <Button 
                       variant="outline" 
                       className="w-full justify-start text-left font-normal border-gray-300 hover:bg-gray-50 text-sm"
                     >
                       <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                    {format(filters.selectedDate, "dd MMM yyyy", { locale: id })}
                  </Button>
                </PopoverTrigger>
                   <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.selectedDate}
                    onSelect={(date) => date && setFilters(prev => ({ ...prev, selectedDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

               {/* Category Filter - Only for Sarana */}
            <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                   <Package className="w-4 h-4" />
                   {activeTab === 'sarana' ? 'Kategori Sarana' : 'Filter Tambahan'}
                 </label>
                 {activeTab === 'sarana' ? (
              <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger className="w-full border-gray-300 text-sm bg-gray-50">
                        <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
                 ) : (
                   <div className="h-9 w-full flex items-center text-sm text-gray-500 px-3 border border-gray-300 rounded-md bg-gray-50">
                     Tidak ada filter tambahan
                   </div>
                 )}
            </div>

            {/* Availability Filter */}
            <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                   <CheckCircle className="w-4 h-4" />
                   Status Ketersediaan
                 </label>
                  <Select value={filters.availability} onValueChange={(value: 'all' | 'available' | 'unavailable') => setFilters(prev => ({ ...prev, availability: value }))}>
                    <SelectTrigger className="w-full border-gray-300 text-sm bg-gray-50">
                      <SelectValue placeholder="Pilih ketersediaan" />
                    </SelectTrigger>
                    <SelectContent>
                     <SelectItem value="all">Semua Status</SelectItem>
                     <SelectItem value="available">
                       <div className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                         Tersedia
                       </div>
                     </SelectItem>
                     <SelectItem value="unavailable">
                       <div className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                         Tidak Tersedia
                       </div>
                     </SelectItem>
                </SelectContent>
              </Select>
               </div>
            </div>

            {/* Active Filters Summary */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Filter aktif:</span>
              
              {/* Date Filter Badge */}
              <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
                <CalendarIcon className="w-3 h-3 mr-1" />
                {format(filters.selectedDate, "dd MMM", { locale: id })}
              </Badge>
              
              {/* Category Filter Badge */}
              {filters.category !== 'all' && (
                <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                  <Package className="w-3 h-3 mr-1" />
                  {categories.find(c => c.id === filters.category)?.nama || 'Kategori'}
                </Badge>
              )}
              
              {/* Availability Filter Badge */}
              {filters.availability !== 'all' && (
                <Badge variant="outline" className={cn(
                  "text-xs",
                  filters.availability === 'available' 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-red-50 text-red-700 border-red-200"
                )}>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {filters.availability === 'available' ? 'Tersedia' : 'Tidak Tersedia'}
                </Badge>
              )}
              
              {/* Search Query Badge */}
              {searchQuery && (
                <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">
                  <Search className="w-3 h-3 mr-1" />
                  "{searchQuery}"
                </Badge>
              )}
              
                             {/* Clear Filters Button */}
               {(filters.category !== 'all' || filters.availability !== 'all' || searchQuery) && (
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => {
                     setFilters(prev => ({ ...prev, category: 'all', availability: 'all' }));
                     setSearchQuery('');
                   }}
                   className="text-xs text-gray-500 hover:text-gray-700 h-6 px-2"
                 >
                   Hapus Semua
              </Button>
               )}
          </div>

            {/* Summary Information */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-md p-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-indigo-100 rounded">
                  <CalendarIcon className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-indigo-900 mb-1">Informasi Pencarian</h4>
                  <div className="text-sm text-indigo-800 space-y-1">
                    <p><strong>Tanggal:</strong> {format(filters.selectedDate, "dd MMMM yyyy", { locale: id })}</p>
                    <p><strong>Hasil:</strong> {activeTab === 'sarana' ? filteredSarana.length : filteredPrasarana.length} {activeTab === 'sarana' ? 'sarana' : 'prasarana'} ditemukan</p>
                    {(filteredSarana.length === 0 && activeTab === 'sarana') || (filteredPrasarana.length === 0 && activeTab === 'prasarana') ? (
                      <p className="text-amber-600"><strong>Tips:</strong> Coba ubah tanggal atau filter untuk hasil yang lebih baik</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
          </div>

      {/* Data Table - Following Design System Pattern */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-md">
              <Package className="w-5 h-5 text-emerald-600" />
          </div>
            <h3 className="text-lg font-semibold text-gray-900">Daftar Sarana Prasarana</h3>
          </div>
        </div>
        
        <div className="p-5">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger 
                value="sarana" 
                className="flex items-center gap-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
              >
                <Package className="w-4 h-4" />
                Sarana ({filteredSarana.length})
              </TabsTrigger>
              <TabsTrigger 
                value="prasarana" 
                className="flex items-center gap-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
              >
                <Building className="w-4 h-4" />
                Prasarana ({filteredPrasarana.length})
              </TabsTrigger>
            </TabsList>

            {/* Sarana Tab */}
            <TabsContent value="sarana" className="space-y-4">
              {filteredSarana.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery || filters.category !== 'all' || filters.availability !== 'all' 
                      ? 'Tidak ada sarana yang sesuai filter' 
                      : 'Tidak ada data sarana'
                    }
                  </h3>
                  <p className="text-gray-500">
                    {searchQuery || filters.category !== 'all' || filters.availability !== 'all'
                      ? 'Coba ubah filter atau kata kunci pencarian' 
                      : 'Data sarana belum tersedia'
                    }
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSarana.map((sarana) => {
                    const stockPercentage = getStockPercentage(sarana);
                    const availableStock = sarana.availableStock ?? sarana.sisa;
                    const bookedStock = sarana.bookedStock ?? 0;
                    
                    return (
                      <Card 
                        key={sarana.id} 
                        className={cn(
                          "cursor-pointer transition-all duration-200 hover:shadow-md border-gray-200 hover:border-gray-300",
                          availableStock > 0 ? "hover:border-emerald-300" : "hover:border-red-300 opacity-75"
                        )}
                        onClick={() => handleItemClick(sarana, 'sarana')}
                      >
                        {/* Image Section */}
                        <div className="relative w-full bg-gray-50 rounded-t-lg p-3">
                          <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          {sarana.image_url ? (
                            <GoogleDriveImage 
                              src={sarana.image_url} 
                              alt={sarana.nama}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              fallback={
                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                    <Package className="w-10 h-10 text-gray-400" />
                                </div>
                              }
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-10 h-10 text-gray-400" />
                            </div>
                          )}
                          
                          {/* Availability Overlay */}
                          <div className="absolute top-2 right-2">
                            {getAvailabilityBadge(sarana, 'sarana')}
                            </div>
                          </div>
                        </div>

                        <CardContent className="p-4 space-y-3">
                          {/* Header */}
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{sarana.nama}</h3>
                              {sarana.kategoriSarana && (
                                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-100">
                                  {sarana.kategoriSarana.nama}
                                </Badge>
                              )}
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="ml-2 border-gray-300 hover:bg-gray-50"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          {/* Stock Info */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Tersedia:</span>
                              <span className={`font-medium ${availableStock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {availableStock} / {sarana.stok} {sarana.satuanSatuan?.singkatan || 'unit'}
                              </span>
                            </div>
                            
                            {bookedStock > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Dipinjam:</span>
                                <span className="font-medium text-amber-600">
                                  {bookedStock} {sarana.satuanSatuan?.singkatan || 'unit'}
                                </span>
                              </div>
                            )}
                            
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all ${getStockColor(stockPercentage)}`}
                                style={{ width: `${stockPercentage}%` }}
                              />
                            </div>
                          </div>

                          {/* Status and Details */}
                          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                              <Badge variant={getStatusBadgeVariant(sarana.status)}>
                                {sarana.status}
                              </Badge>
                            </div>
                            
                            {sarana.lokasi && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate max-w-20">{sarana.lokasi}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Prasarana Tab */}
            <TabsContent value="prasarana" className="space-y-4">
              {filteredPrasarana.length === 0 ? (
                <div className="text-center py-12">
                  <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery || filters.availability !== 'all'
                      ? 'Tidak ada prasarana yang sesuai filter' 
                      : 'Tidak ada data prasarana'
                    }
                  </h3>
                  <p className="text-gray-500">
                    {searchQuery || filters.availability !== 'all'
                      ? 'Coba ubah filter atau kata kunci pencarian' 
                      : 'Data prasarana belum tersedia'
                    }
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredPrasarana.map((prasarana) => (
                    <Card 
                      key={prasarana.id} 
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:shadow-md border-gray-200 hover:border-gray-300",
                        prasarana.isAvailable ? "hover:border-emerald-300" : "hover:border-amber-300 opacity-90"
                      )}
                      onClick={() => handleItemClick(prasarana, 'prasarana')}
                    >
                      {/* Carousel for multiple images */}
                      {prasarana.image_url && prasarana.image_url.length > 0 ? (
                        <Carousel 
                          images={prasarana.image_url.map(img => img.image_url)} 
                          aspectRatio="video"
                          className="w-full rounded-t-lg overflow-hidden"
                        />
                      ) : (
                        <div className="w-full aspect-video bg-gray-100 flex items-center justify-center rounded-t-lg">
                          <Building className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      
                      <CardContent className="p-4">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">{prasarana.nama}</h3>
                          {getAvailabilityBadge(prasarana, 'prasarana')}
                        </div>
                        
                        {/* Details */}
                        <div className="space-y-3">
                          {prasarana.kapasitas && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Users className="w-4 h-4" />
                              <span>Kapasitas: {prasarana.kapasitas} orang</span>
                            </div>
                          )}
                          
                          {prasarana.lokasi && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span className="truncate">{prasarana.lokasi}</span>
                            </div>
                          )}

                          {/* Availability info */}
                          {!prasarana.isAvailable && prasarana.nextAvailableDate && (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-800">
                              <Clock className="w-3 h-3 inline mr-1" />
                              Tersedia kembali: {format(new Date(prasarana.nextAvailableDate!), "dd MMM yyyy", { locale: id })}
                            </div>
                          )}

                          {prasarana.deskripsi && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {prasarana.deskripsi}
                            </p>
                          )}
                        </div>

                        {/* Status */}
                        <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-100">
                          <Badge variant={getStatusBadgeVariant(prasarana.status)}>
                            {prasarana.status}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-gray-300 hover:bg-gray-50"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Detail
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Enhanced Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {selectedItem ? selectedItem.nama : ''} - Detail {selectedType === 'sarana' ? 'Sarana' : 'Prasarana'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              {/* Image Section */}
              <div className={cn(
                "w-full rounded-lg",
                selectedType === 'sarana' 
                  ? "bg-gray-50 p-4" 
                  : "bg-gray-100 overflow-hidden h-64"
              )}>
                {selectedType === 'sarana' ? (
                  <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {(selectedItem as Sarana).image_url ? (
                  <GoogleDriveImage 
                    src={(selectedItem as Sarana).image_url!} 
                    alt={selectedItem.nama}
                    fill
                    className="object-cover"
                    fallback={
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-16 h-16 text-gray-400" />
                      </div>
                    }
                  />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-gray-400" />
                </div>
              )}
                  </div>
                ) : (
                  (selectedItem as Prasarana).image_url && (selectedItem as Prasarana).image_url!.length > 0 ? (
                <Carousel 
                  images={(selectedItem as Prasarana).image_url!.map(img => img.image_url)} 
                  aspectRatio="video"
                      className="w-full h-64"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building className="w-16 h-16 text-gray-400" />
                    </div>
                  )
                        )}
                      </div>
              
              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                <div>
                    <h4 className="font-medium text-gray-900 mb-1">Nama</h4>
                    <p className="text-gray-700">{selectedItem.nama}</p>
                </div>
                
                <div>
                    <h4 className="font-medium text-gray-900 mb-1">Status</h4>
                    <Badge variant={getStatusBadgeVariant(selectedItem.status)}>
                      {selectedItem.status}
                    </Badge>
                </div>
                
                  {selectedItem.lokasi && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Lokasi</h4>
                      <p className="text-gray-700 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {selectedItem.lokasi}
                      </p>
                    </div>
                  )}
                    </div>
                    
                <div className="space-y-3">
                  {selectedType === 'sarana' ? (
                    <>
                    <div>
                        <h4 className="font-medium text-gray-900 mb-1">Kategori</h4>
                        <p className="text-gray-700">
                          {(selectedItem as Sarana).kategoriSarana?.nama || 'Tidak ada kategori'}
                      </p>
                    </div>
                    
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Stok</h4>
                        <div className="space-y-2">
                          <p className="text-gray-700">
                            Total: {(selectedItem as Sarana).stok} {(selectedItem as Sarana).satuanSatuan?.singkatan || 'unit'}
                          </p>
                          <p className="text-gray-700">
                            Tersedia: {(selectedItem as Sarana).availableStock ?? (selectedItem as Sarana).sisa} {(selectedItem as Sarana).satuanSatuan?.singkatan || 'unit'}
                          </p>
                          {((selectedItem as Sarana).bookedStock ?? 0) > 0 && (
                            <p className="text-amber-600">
                              Dipinjam: {(selectedItem as Sarana).bookedStock} {(selectedItem as Sarana).satuanSatuan?.singkatan || 'unit'}
                            </p>
                          )}
                      </div>
                      </div>
                  </>
                  ) : (
                  <>
                    {(selectedItem as Prasarana).kapasitas && (
                      <div>
                          <h4 className="font-medium text-gray-900 mb-1">Kapasitas</h4>
                          <p className="text-gray-700 flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {(selectedItem as Prasarana).kapasitas} orang
                          </p>
                      </div>
                    )}
                    
                      {(selectedItem as Prasarana).deskripsi && (
                      <div>
                          <h4 className="font-medium text-gray-900 mb-1">Deskripsi</h4>
                          <p className="text-gray-700">{(selectedItem as Prasarana).deskripsi}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
                </div>

              {/* Availability Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  Ketersediaan untuk {format(filters.selectedDate, "dd MMMM yyyy", { locale: id })}
                </h4>
                <div className="flex items-center gap-2">
                  {getAvailabilityBadge(selectedItem, selectedType)}
                  {selectedType === 'prasarana' && !(selectedItem as Prasarana).isAvailable && (selectedItem as Prasarana).nextAvailableDate && (
                    <span className="text-sm text-gray-600">
                      - Tersedia kembali: {format(new Date((selectedItem as Prasarana).nextAvailableDate!), "dd MMM yyyy", { locale: id })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 
"use client";

import { useState, useEffect, useCallback } from "react";
import { format, addDays, isSameDay, startOfDay, endOfDay } from "date-fns";
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
import { Package, Building, Search, Eye, MapPin, Users, Calendar as CalendarIcon, Filter, RefreshCw, AlertTriangle, CheckCircle, Clock } from "lucide-react";
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

export function DaftarSarprasClient() {
  const [saranaList, setSaranaList] = useState<Sarana[]>([]);
  const [prasaranaList, setPrasaranaList] = useState<Prasarana[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<Sarana | Prasarana | null>(null);
  const [selectedType, setSelectedType] = useState<'sarana' | 'prasarana'>('sarana');
  const [activeTab, setActiveTab] = useState("sarana");
  const [categories, setCategories] = useState<Array<{id: string, nama: string}>>([]);
  
  // Simplified filtering with single date
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
      } else {
        console.error('Error fetching categories:', response.error);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const checkAvailability = async () => {
    if (!filters.selectedDate) return;
    
    setRefreshing(true);
    try {
      // Use the same date for start and end to check single day availability
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
      } else {
        toast.error(saranaAvailabilityResponse.error || 'Gagal memeriksa ketersediaan sarana');
      }

      // Update prasarana with availability info
      if (prasaranaAvailabilityResponse.success && prasaranaAvailabilityResponse.data) {
        setPrasaranaList(prev => prev.map(prasarana => {
          const availability = prasaranaAvailabilityResponse.data!.find(a => a.id === prasarana.id);
          if (availability) {
            return {
              ...prasarana,
              isAvailable: availability.isAvailable,
              bookedDates: availability.bookedDates.map(date => date.start), // Simplify for UI
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
      } else {
        toast.error(prasaranaAvailabilityResponse.error || 'Gagal memeriksa ketersediaan prasarana');
      }

    } catch (error) {
      console.error('Error checking availability:', error);
      toast.error('Gagal memeriksa ketersediaan');
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = useCallback(() => {
    checkAvailability();
  }, [filters.selectedDate]);

  // Filter functions
  const filterSarana = (items: Sarana[]): Sarana[] => {
    let filtered = items;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kategoriSarana?.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.lokasi?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(item => item.kategoriSarana?.id === filters.category);
    }

    // Availability filter
    if (filters.availability === 'available') {
      filtered = filtered.filter(item => item.isAvailable && (item.availableStock || 0) > 0);
    } else if (filters.availability === 'unavailable') {
      filtered = filtered.filter(item => !item.isAvailable || (item.availableStock || 0) === 0);
    }

    return filtered;
  };

  const filterPrasarana = (items: Prasarana[]): Prasarana[] => {
    let filtered = items;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.deskripsi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.lokasi?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Availability filter
    if (filters.availability === 'available') {
      filtered = filtered.filter(item => item.isAvailable);
    } else if (filters.availability === 'unavailable') {
      filtered = filtered.filter(item => !item.isAvailable);
    }

    return filtered;
  };

  const filteredSarana = filterSarana(saranaList);
  const filteredPrasarana = filterPrasarana(prasaranaList);

  const handleItemClick = (item: Sarana | Prasarana, type: 'sarana' | 'prasarana') => {
    setSelectedItem(item);
    setSelectedType(type);
  };

  const getStockPercentage = (sarana: Sarana): number => {
    const availableStock = sarana.availableStock ?? sarana.sisa;
    return sarana.stok > 0 ? (availableStock / sarana.stok) * 100 : 0;
  };

  const getStockColor = (percentage: number): string => {
    if (percentage > 50) return 'bg-green-500';
    if (percentage > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getAvailabilityBadge = (item: Sarana | Prasarana, type: 'sarana' | 'prasarana') => {
    if (type === 'sarana') {
      const sarana = item as Sarana;
      const availableStock = sarana.availableStock ?? sarana.sisa;
      
      if (availableStock > 0) {
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">
          <CheckCircle className="w-3 h-3 mr-1" />
          Tersedia
        </Badge>;
      } else {
        return <Badge variant="destructive">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Tidak Tersedia
        </Badge>;
      }
    } else {
      const prasarana = item as Prasarana;
      
      if (prasarana.isAvailable) {
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">
          <CheckCircle className="w-3 h-3 mr-1" />
          Tersedia
        </Badge>;
      } else {
        return <Badge variant="destructive">
          <Clock className="w-3 h-3 mr-1" />
          Sedang Dipinjam
        </Badge>;
      }
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "destructive" | "secondary" => {
    return status === 'TERSEDIA' ? 'default' : 'destructive';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-gray-500">Memuat data sarpras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Simplified Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-500" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Single Date and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tanggal</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(filters.selectedDate, "dd MMM yyyy", { locale: id })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.selectedDate}
                    onSelect={(date) => date && setFilters(prev => ({ 
                      ...prev, 
                      selectedDate: date 
                    }))}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {activeTab === 'sarana' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Kategori</label>
                <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.nama}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Ketersediaan</label>
              <Select value={filters.availability} onValueChange={(value: any) => setFilters(prev => ({ ...prev, availability: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="available">Tersedia</SelectItem>
                  <SelectItem value="unavailable">Tidak Tersedia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Aksi</label>
              <Button onClick={handleRefresh} disabled={refreshing} variant="outline" className="w-full">
                <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
                {refreshing ? 'Memuat...' : 'Refresh'}
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari nama, kategori, atau lokasi sarpras..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Date Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              <strong>Tanggal terpilih:</strong> {format(filters.selectedDate, "dd MMMM yyyy", { locale: id })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Daftar Sarpras dalam Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-green-600" />
            Daftar Sarana Prasarana
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Tabs for Sarana and Prasarana */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sarana" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Sarana ({filteredSarana.length})
              </TabsTrigger>
              <TabsTrigger value="prasarana" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Prasarana ({filteredPrasarana.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sarana" className="space-y-4 mt-6">
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
                          "cursor-pointer transition-all duration-200 hover:-translate-y-1",
                          availableStock > 0 ? "hover:shadow-lg border-green-200" : "hover:shadow-md border-red-200 opacity-75"
                        )}
                        onClick={() => handleItemClick(sarana, 'sarana')}
                      >
                        <CardContent className="p-0">
                          {/* Image */}
                          <div className="relative w-full h-40 bg-gray-100 rounded-t-lg overflow-hidden">
                            {sarana.image_url ? (
                              <GoogleDriveImage 
                                src={sarana.image_url} 
                                alt={sarana.nama}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                fallback={
                                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                    <Package className="w-12 h-12 text-gray-400" />
                                  </div>
                                }
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-12 h-12 text-gray-400" />
                              </div>
                            )}
                            
                            {/* Availability Overlay */}
                            <div className="absolute top-2 right-2">
                              {getAvailabilityBadge(sarana, 'sarana')}
                            </div>
                          </div>

                          <div className="p-4 space-y-3">
                            {/* Header */}
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg line-clamp-2 mb-1">{sarana.nama}</h3>
                                {sarana.kategoriSarana && (
                                  <Badge variant="secondary" className="text-xs">
                                    {sarana.kategoriSarana.nama}
                                  </Badge>
                                )}
                              </div>
                              <Button size="sm" variant="outline" className="ml-2">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            {/* Stock Info */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tersedia:</span>
                                <span className={`font-medium ${availableStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {availableStock} / {sarana.stok} {sarana.satuanSatuan?.singkatan || 'unit'}
                                </span>
                              </div>
                              
                              {bookedStock > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Dipinjam:</span>
                                  <span className="font-medium text-orange-600">
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
                            <div className="flex justify-between items-center pt-2">
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
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="prasarana" className="space-y-4 mt-6">
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
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPrasarana.map((prasarana) => (
                    <Card 
                      key={prasarana.id} 
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:-translate-y-1",
                        prasarana.isAvailable ? "hover:shadow-lg border-green-200" : "hover:shadow-md border-red-200 opacity-75"
                      )}
                      onClick={() => handleItemClick(prasarana, 'prasarana')}
                    >
                      <CardContent className="p-0">
                        {/* Image */}
                        <div className="relative w-full h-40 bg-gray-100 rounded-t-lg overflow-hidden">
                          {prasarana.image_url && prasarana.image_url.length > 0 ? (
                            <GoogleDriveImage 
                              src={prasarana.image_url[0].image_url} 
                              alt={prasarana.nama}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              fallback={
                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                  <Building className="w-12 h-12 text-gray-400" />
                                </div>
                              }
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Building className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                          
                          {/* Availability Overlay */}
                          <div className="absolute top-2 right-2">
                            {getAvailabilityBadge(prasarana, 'prasarana')}
                          </div>
                        </div>

                        <div className="p-4 space-y-3">
                          {/* Header */}
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg line-clamp-2 mb-1">{prasarana.nama}</h3>
                            </div>
                            <Button size="sm" variant="outline" className="ml-2">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          {/* Details */}
                          <div className="space-y-2">
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
                              <div className="p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
                                <Clock className="w-3 h-3 inline mr-1" />
                                Tersedia kembali: {format(new Date(prasarana.nextAvailableDate!), "dd MMM yyyy", { locale: id })}
                              </div>
                            )}
                          </div>

                          {/* Status */}
                          <div className="flex justify-between items-center pt-2">
                            <Badge variant={getStatusBadgeVariant(prasarana.status)}>
                              {prasarana.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Enhanced Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedType === 'sarana' ? <Package className="w-5 h-5" /> : <Building className="w-5 h-5" />}
              {selectedItem?.nama}
              <div className="ml-auto">
                {selectedItem && getAvailabilityBadge(selectedItem, selectedType)}
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-6">
              {/* Image Gallery */}
              {selectedType === 'sarana' && (selectedItem as Sarana).image_url && (
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <GoogleDriveImage 
                    src={(selectedItem as Sarana).image_url!} 
                    alt={selectedItem.nama}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 70vw"
                    fallback={
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <Package className="w-12 h-12 text-gray-400" />
                      </div>
                    }
                  />
                </div>
              )}
              
              {selectedType === 'prasarana' && (selectedItem as Prasarana).image_url && (selectedItem as Prasarana).image_url!.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {(selectedItem as Prasarana).image_url!.slice(0, 4).map((img, index) => (
                    <div key={img.id} className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <GoogleDriveImage 
                        src={img.image_url} 
                        alt={`${selectedItem.nama} ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                        fallback={
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <Building className="w-12 h-12 text-gray-400" />
                          </div>
                        }
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Availability Summary for selected date */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-blue-800">
                    Ketersediaan untuk Tanggal Terpilih
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-blue-700">Tanggal:</span>
                      <p className="text-blue-600">
                        {format(filters.selectedDate, "dd MMMM yyyy", { locale: id })}
                      </p>
                    </div>
                    
                    {selectedType === 'sarana' && (
                      <div>
                        <span className="font-medium text-blue-700">Stok Tersedia:</span>
                        <p className="text-blue-600">
                          {(selectedItem as Sarana).availableStock ?? (selectedItem as Sarana).sisa} / {(selectedItem as Sarana).stok} {(selectedItem as Sarana).satuanSatuan?.singkatan || 'unit'}
                        </p>
                        {((selectedItem as Sarana).bookedStock ?? 0) > 0 && (
                          <p className="text-orange-600 text-xs mt-1">
                            {(selectedItem as Sarana).bookedStock} unit sedang dipinjam
                          </p>
                        )}
                      </div>
                    )}
                    
                    {selectedType === 'prasarana' && (
                      <div>
                        <span className="font-medium text-blue-700">Status:</span>
                        <p className="text-blue-600">
                          {(selectedItem as Prasarana).isAvailable ? 'Tersedia' : 'Sedang Dipinjam'}
                        </p>
                        {!(selectedItem as Prasarana).isAvailable && (selectedItem as Prasarana).nextAvailableDate && (
                          <p className="text-orange-600 text-xs mt-1">
                            Tersedia kembali: {format(new Date((selectedItem as Prasarana).nextAvailableDate!), "dd MMM yyyy", { locale: id })}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Details Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nama</label>
                  <p className="text-base text-gray-900 mt-1">{selectedItem.nama}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <Badge variant={getStatusBadgeVariant(selectedItem.status)}>
                      {selectedItem.status}
                    </Badge>
                  </div>
                </div>
                
                {selectedType === 'sarana' && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Total Stok</label>
                      <p className="text-base text-gray-900 mt-1">
                        {(selectedItem as Sarana).stok} {(selectedItem as Sarana).satuanSatuan?.singkatan || 'unit'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Jenis</label>
                      <p className="text-base text-gray-900 mt-1">
                        {(selectedItem as Sarana).jenis === 'BERNOMOR' ? 'Bernomor Seri' : 'Tidak Bernomor'}
                      </p>
                    </div>
                    
                    {(selectedItem as Sarana).kategoriSarana && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Kategori</label>
                        <p className="text-base text-gray-900 mt-1">{(selectedItem as Sarana).kategoriSarana!.nama}</p>
                      </div>
                    )}

                    {(selectedItem as Sarana).lokasi && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Lokasi</label>
                        <p className="text-base text-gray-900 mt-1">{(selectedItem as Sarana).lokasi}</p>
                      </div>
                    )}
                  </>
                )}
                
                {selectedType === 'prasarana' && (
                  <>
                    {(selectedItem as Prasarana).kapasitas && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Kapasitas</label>
                        <p className="text-base text-gray-900 mt-1">{(selectedItem as Prasarana).kapasitas} orang</p>
                      </div>
                    )}
                    
                    {(selectedItem as Prasarana).lokasi && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Lokasi</label>
                        <p className="text-base text-gray-900 mt-1">{(selectedItem as Prasarana).lokasi}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {/* Description for Prasarana */}
              {selectedType === 'prasarana' && (selectedItem as Prasarana).deskripsi && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Deskripsi</label>
                  <p className="text-base text-gray-900 mt-1">{(selectedItem as Prasarana).deskripsi}</p>
                </div>
              )}

              {/* Action Button */}
              <div className="flex justify-end pt-4 border-t">
                <Button 
                  asChild 
                  disabled={selectedType === 'sarana' ? !((selectedItem as Sarana).availableStock ?? (selectedItem as Sarana).sisa) : !(selectedItem as Prasarana).isAvailable}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <a href="/peminjam/peminjaman" className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Ajukan Peminjaman
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 
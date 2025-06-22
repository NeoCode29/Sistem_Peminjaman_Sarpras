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
import { Package, Building, Search, Eye, MapPin, Users, Calendar as CalendarIcon, Filter, RefreshCw, AlertTriangle, CheckCircle, Clock, ImageIcon } from "lucide-react";
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
    if (percentage > 50) return 'bg-green-500';
    if (percentage > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getAvailabilityBadge = (item: Sarana | Prasarana, type: 'sarana' | 'prasarana') => {
    if (type === 'sarana') {
      const sarana = item as Sarana;
      const available = sarana.availableStock ?? sarana.sisa;
      if (available > 0) {
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Tersedia</Badge>;
      } else {
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Habis</Badge>;
      }
    } else {
      const prasarana = item as Prasarana;
      if (prasarana.isAvailable) {
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Tersedia</Badge>;
      } else {
        return <Badge className="bg-red-100 text-red-800"><Clock className="w-3 h-3 mr-1" />Dipinjam</Badge>;
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
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Daftar Sarana Prasarana</h1>
        <p className="text-gray-600 mt-2">
          Lihat ketersediaan sarana dan prasarana berdasarkan tanggal yang Anda pilih.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tanggal</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(filters.selectedDate, "dd MMM yyyy", { locale: id })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.selectedDate}
                    onSelect={(date) => date && setFilters(prev => ({ ...prev, selectedDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Kategori</label>
              <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
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
            </div>

            {/* Availability Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Ketersediaan</label>
              <Select value={filters.availability} onValueChange={(value: 'all' | 'available' | 'unavailable') => setFilters(prev => ({ ...prev, availability: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih ketersediaan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="available">Tersedia</SelectItem>
                  <SelectItem value="unavailable">Tidak Tersedia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Refresh Button */}
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

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-green-600" />
            Daftar Sarana Prasarana
          </CardTitle>
        </CardHeader>
        <CardContent>
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

            {/* Sarana Tab */}
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
                          "cursor-pointer transition-all duration-200 hover:-translate-y-1 overflow-hidden",
                          availableStock > 0 ? "hover:shadow-lg border-green-200" : "hover:shadow-md border-red-200 opacity-75"
                        )}
                        onClick={() => handleItemClick(sarana, 'sarana')}
                      >
                        {/* Image Section */}
                        <div className="relative w-full h-40 bg-gray-100">
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

                        <CardContent className="p-4 space-y-3">
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
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Prasarana Tab */}
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
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredPrasarana.map((prasarana) => (
                    <Card 
                      key={prasarana.id} 
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:-translate-y-1 overflow-hidden",
                        prasarana.isAvailable ? "hover:shadow-lg border-green-200" : "hover:shadow-md border-red-200 opacity-75"
                      )}
                      onClick={() => handleItemClick(prasarana, 'prasarana')}
                    >
                      {/* Carousel for multiple images */}
                      {prasarana.image_url && prasarana.image_url.length > 0 ? (
                        <Carousel 
                          images={prasarana.image_url.map(img => img.image_url)} 
                          aspectRatio="video"
                          className="w-full"
                        />
                      ) : (
                        <div className="w-full aspect-video bg-gray-100 flex items-center justify-center">
                          <Building className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      
                      <CardContent className="p-4">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold truncate">{prasarana.nama}</h3>
                          {getAvailabilityBadge(prasarana, 'prasarana')}
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

                          {prasarana.deskripsi && (
                            <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                              {prasarana.deskripsi}
                            </p>
                          )}
                        </div>

                        {/* Status */}
                        <div className="flex justify-between items-center pt-3 mt-3 border-t">
                          <Badge variant={getStatusBadgeVariant(prasarana.status)}>
                            {prasarana.status}
                          </Badge>
                          <Button size="sm" variant="outline">
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
                <Carousel 
                  images={(selectedItem as Prasarana).image_url!.map(img => img.image_url)} 
                  aspectRatio="video"
                  className="w-full"
                />
              )}

              {/* Availability Summary */}
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
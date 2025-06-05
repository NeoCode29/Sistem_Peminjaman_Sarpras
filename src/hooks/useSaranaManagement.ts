"use client"

import { useCallback, useState } from "react";
import { SaranaFormData } from "@/actions/saranaManagementActions";
import {
  getSarana,
  getKategoriOptions,
  getSatuanOptions,
  createSarana,
  updateSarana,
  deleteSarana,
  getSaranaById,
} from "@/actions/saranaManagementActions";
import { toast } from "sonner";
import { SaranaWithRelations } from "@/service/saranaService";
import { JenisBarang } from "@prisma/client";

interface UseSaranaManagementProps {
  initialPage?: number;
  initialLimit?: number;
}

interface SortConfig {
  field: string;
  direction: "asc" | "desc";
}

interface FilterConfig {
  search: string;
  kategori: string;
}

export function useSaranaManagement({
  initialPage = 1,
  initialLimit = 10,
}: UseSaranaManagementProps = {}) {
  // Data states
  const [data, setData] = useState<SaranaWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SaranaWithRelations | undefined>(undefined);

  // Pagination states
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
  });

  // Filter states
  const [filters, setFilters] = useState<FilterConfig>({
    search: "",
    kategori: "",
  });

  // Sort states
  const [sort, setSort] = useState<SortConfig>({
    field: "nama",
    direction: "asc",
  });

  // Options states
  const [kategoriOptions, setKategoriOptions] = useState<Array<{ value: string; label: string; }>>([]);
  const [satuanOptions, setSatuanOptions] = useState<Array<{ value: string; label: string; }>>([]);

  // Dialog states
  const [dialogs, setDialogs] = useState({
    add: false,
    edit: false,
    delete: false,
    info: false,
  });

  // Fetch sarana data
  const fetchSarana = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getSarana({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        kategori: filters.kategori,
        sortBy: sort.field,
        sortOrder: sort.direction,
      });

      if (result.success && result.data) {
        setData(result.data.sarana);
        setPagination(prev => ({
          ...prev,
          total: result.data!.metadata.total,
        }));
      } else {
        toast.error("Error", {
          description: result.message,
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "Terjadi kesalahan saat mengambil data sarana",
      });
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, filters, sort]);

  // Fetch options
  const fetchOptions = useCallback(async () => {
    try {
      const [kategoriResult, satuanResult] = await Promise.all([
        getKategoriOptions(),
        getSatuanOptions(),
      ]);

      if (kategoriResult.success) {
        setKategoriOptions(kategoriResult.data);
      }

      if (satuanResult.success) {
        setSatuanOptions(satuanResult.data);
      }
    } catch (error) {
      toast.error("Error", {
        description: "Gagal memuat opsi kategori dan satuan",
      });
    }
  }, []);

  // CRUD Operations
  const handleCreate = async (data: SaranaFormData) => {
    try {
      setIsLoading(true);
      const formData = {
        ...data,
        stok: data.jenis === JenisBarang.TIDAK_BERNOMOR ? data.stok || 0 : undefined,
        detailSarana: data.jenis === JenisBarang.BERNOMOR ? data.detailSarana : undefined,
      };
      
      const result = await createSarana(formData);

      if (!result.success) {
        throw new Error(result.message);
      }

      return result;
    } catch (error) {
      console.error("Error creating sarana:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id: string, data: Partial<SaranaFormData>) => {
    try {
      setIsLoading(true);
      const formData = {
        ...data,
        stok: data.jenis === JenisBarang.TIDAK_BERNOMOR ? data.stok || 0 : undefined,
        detailSarana: data.jenis === JenisBarang.BERNOMOR ? data.detailSarana : undefined,
      };

      const result = await updateSarana(id, formData);

      if (!result.success) {
        throw new Error(result.message);
      }

      return result;
    } catch (error) {
      console.error("Error updating sarana:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      const result = await deleteSarana(id);

      if (result.success) {
        toast.success("Sukses", {
          description: "Sarana berhasil dihapus",
        });
        await fetchSarana();
        setDialogs(prev => ({ ...prev, delete: false }));
      } else {
        toast.error("Error", {
          description: result.message,
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "Gagal menghapus sarana",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Dialog handlers
  const openDialog = (type: keyof typeof dialogs, item?: SaranaWithRelations) => {
    if (item) {
      setSelectedItem(item);
    }
    setDialogs(prev => ({ ...prev, [type]: true }));
  };

  const closeDialog = (type: keyof typeof dialogs) => {
    setDialogs(prev => ({ ...prev, [type]: false }));
    if (selectedItem) {
      setSelectedItem(undefined);
    }
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  // Filter handlers
  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, search: query }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleKategoriFilter = (kategori: string) => {
    setFilters(prev => ({ ...prev, kategori: kategori === "all" ? "" : kategori }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Sort handlers
  const handleSort = (field: string) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  return {
    // States
    data,
    isLoading,
    selectedItem,
    pagination,
    filters,
    sort,
    dialogs,
    kategoriOptions,
    satuanOptions,

    // CRUD operations
    handleCreate,
    handleUpdate,
    handleDelete,

    // Dialog operations
    openDialog,
    closeDialog,

    // Data fetching
    fetchSarana,
    fetchOptions,

    // Pagination handlers
    handlePageChange,
    handleLimitChange,

    // Filter handlers
    handleSearch,
    handleKategoriFilter,

    // Sort handlers
    handleSort,
  };
}

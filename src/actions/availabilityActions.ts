'use server';

import { AvailabilityService, SaranaAvailability, PrasaranaAvailability } from '@/service/availabilityService';

export interface ActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function checkSaranaAvailabilityAction(
  startDate: string, 
  endDate: string
): Promise<ActionResponse<SaranaAvailability[]>> {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return {
        success: false,
        error: 'Format tanggal tidak valid'
      };
    }

    if (start > end) {
      return {
        success: false,
        error: 'Tanggal mulai tidak boleh lebih besar dari tanggal selesai'
      };
    }

    const data = await AvailabilityService.checkSaranaAvailability(start, end);
    
    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal memeriksa ketersediaan sarana'
    };
  }
}

export async function checkPrasaranaAvailabilityAction(
  startDate: string, 
  endDate: string
): Promise<ActionResponse<PrasaranaAvailability[]>> {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return {
        success: false,
        error: 'Format tanggal tidak valid'
      };
    }

    if (start > end) {
      return {
        success: false,
        error: 'Tanggal mulai tidak boleh lebih besar dari tanggal selesai'
      };
    }

    const data = await AvailabilityService.checkPrasaranaAvailability(start, end);
    
    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal memeriksa ketersediaan prasarana'
    };
  }
}

export async function getSaranaWithCategoriesAction(): Promise<ActionResponse<unknown[]>> {
  try {
    const data = await AvailabilityService.getSaranaWithCategories();
    
    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal memuat data sarana'
    };
  }
}

export async function getPrasaranaAction(): Promise<ActionResponse<unknown[]>> {
  try {
    const data = await AvailabilityService.getPrasarana();
    
    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal memuat data prasarana'
    };
  }
}

export async function getCategoriesAction(): Promise<ActionResponse<Array<{id: string, nama: string}>>> {
  try {
    const data = await AvailabilityService.getCategories();
    
    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal memuat data kategori'
    };
  }
} 
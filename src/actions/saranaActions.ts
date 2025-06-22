"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { StatusSarpras } from "@prisma/client"
import { 
  createSarana, 
  updateSarana, 
  deleteSarana, 
  getAllSarana,
  getSaranaById,
  getAvailableSaranaForPickup
} from "@/service/saranaService"
import { createSaranaSchema, updateSaranaSchema } from "@/lib/validations/sarpras"
import { logSaranaActivity } from "@/service/logService"
import { auth } from "@/auth"
// import { uploadImage, deleteImage } from "@/actions/imageManagementActions"
// import { JenisBarang } from "@prisma/client"

// export type { SaranaWithRelations } from "@/service/saranaService"

export async function getSarana({
  page = 1,
  limit = 10,
  search = "",
  kategori,
  status,
  orderBy,
}: {
  page?: number;
  limit?: number;
  search?: string;
  kategori?: string;
  status?: StatusSarpras;
  orderBy?: {
    field: string;
    direction: "asc" | "desc";
  };
} = {}) {
  try {
    const session = await auth()
    const result = await getAllSarana({
      page,
      limit,
      search,
      kategori,
      status,
      orderBy,
    })

    // Log activity
    if (session?.user?.id) {
      await logSaranaActivity(
        session.user.id,
        'VIEW',
        `Daftar Sarana${search ? ` (pencarian: ${search})` : ''}`,
        undefined,
        `Page: ${page}, Limit: ${limit}${kategori ? `, Kategori: ${kategori}` : ''}`
      )
    }

    return result
  } catch (error) {
    return {
      success: false,
      message: "Gagal mengambil data sarana",
      data: null,
    }
  }
}

export async function getSaranaByIdAction(id: string) {
  try {
    const session = await auth()
    const result = await getSaranaById(id)

    // Log activity
    if (session?.user?.id && result.success && result.data) {
      await logSaranaActivity(
        session.user.id,
        'VIEW',
        result.data.nama,
        id,
        'Detail sarana'
      )
    }

    return result
  } catch (error) {
    return {
      success: false,
      message: "Gagal mengambil data sarana",
      data: null,
    }
  }
}

export async function createSaranaAction(data: z.infer<typeof createSaranaSchema>) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized",
        data: null,
      }
    }

    const result = await createSarana(data)
    
    if (result.success && result.data) {
      // Log activity
      await logSaranaActivity(
        session.user.id,
        'CREATE',
        result.data.nama,
        result.data.id,
        `Jenis: ${result.data.jenis}, Stok: ${result.data.stok}`
      )
      
      revalidatePath("/admin/manajemen-sarpras")
    }
    
    return result
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create sarana",
      data: null,
    }
  }
}

export async function updateSaranaAction(id: string, data: z.infer<typeof updateSaranaSchema>) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized",
        data: null,
      }
    }

    const result = await updateSarana(id, data)
    
    if (result.success && result.data) {
      // Log activity
      await logSaranaActivity(
        session.user.id,
        'UPDATE',
        result.data.nama,
        id,
        `Perubahan data sarana`
      )
      
      revalidatePath("/admin/manajemen-sarpras")
    }
    
    return result
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update sarana",
      data: null,
    }
  }
}

export async function deleteSaranaAction(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized",
        data: null,
      }
    }

    // Get sarana name before deleting
    const saranaResult = await getSaranaById(id)
    const saranaName = saranaResult.success && saranaResult.data ? saranaResult.data.nama : `Sarana ID: ${id}`

    const result = await deleteSarana(id)
    
    if (result.success) {
      // Log activity
      await logSaranaActivity(
        session.user.id,
        'DELETE',
        saranaName,
        id,
        'Sarana berhasil dihapus'
      )
      
      revalidatePath("/admin/manajemen-sarpras")
    }
    
    return result
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete sarana",
      data: null,
    }
  }
}

export async function getAllSaranaAction(query?: {
  page?: number;
  limit?: number;
  kategori?: string;
  nama?: string;
  status?: StatusSarpras;
}) {
  try {
    const result = await getAllSarana(query)
    return result
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to get sarana list",
      data: null,
    }
  }
}

export async function getAvailableSaranaForPickupAction() {
  try {
    const result = await getAvailableSaranaForPickup()
    return result
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to get available sarana for pickup",
      data: null,
    }
  }
}

// export async function handleBorrowSarana(id: string, quantity: number, nomerSeri?: string) {
//   const result = await saranaService.borrowSarana(id, quantity, nomerSeri)
//   if (result.success) {
//     revalidatePath("/peminjaman")
//   }
//   return result
// }

// export async function handleReturnSarana(id: string, quantity: number, nomerSeri?: string) {
//   const result = await saranaService.returnSarana(id, quantity, nomerSeri)
//   if (result.success) {
//     revalidatePath("/pengembalian")
//   }
//   return result
// } 
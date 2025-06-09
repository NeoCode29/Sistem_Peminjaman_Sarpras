"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { StatusSarpras, JenisBarang } from "@prisma/client"
import * as saranaService from "@/service/saranaService"
import { createSaranaSchema, updateSaranaSchema } from "@/lib/validations/sarpras"

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
    const result = await saranaService.getAllSarana({
      page,
      limit,
      search,
      kategori,
      status,
      orderBy,
    })

    return result
  } catch (error) {
    console.error("[getSarana]", error)
    return {
      success: false,
      message: "Gagal mengambil data sarana",
      data: null,
    }
  }
}

export async function getSaranaById(id: string) {
  try {
    const result = await saranaService.getSaranaById(id)
  return result
  } catch (error) {
    console.error("[getSaranaById]", error)
    return {
      success: false,
      message: "Gagal mengambil data sarana",
      data: null,
    }
  }
}

export async function createSarana(data: z.infer<typeof createSaranaSchema>) {
  try {
    // Validate input
    const validated = createSaranaSchema.parse(data)

    // Create sarana
    const result = await saranaService.createSarana(validated)

  if (result.success) {
    revalidatePath("/admin/manajemen-sarpras")
  }

  return result
  } catch (error) {
    console.error("[createSarana]", error)
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => {
        const field = err.path.join('.')
        return `${field}: ${err.message}`
      }).join('\n')
      
      return {
        success: false,
        message: errorMessages,
        data: null,
      }
    }
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal membuat sarana",
      data: null,
    }
  }
}

export async function updateSarana(id: string, data: z.infer<typeof updateSaranaSchema>) {
  try {
    // Validate input
    const validated = updateSaranaSchema.parse(data)

    // Update sarana
    const result = await saranaService.updateSarana(id, validated)

  if (result.success) {
    revalidatePath("/admin/manajemen-sarpras")
  }

  return result
  } catch (error) {
    console.error("[updateSarana]", error)
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => {
        const field = err.path.join('.')
        return `${field}: ${err.message}`
      }).join('\n')
      
      return {
        success: false,
        message: errorMessages,
        data: null,
      }
  }
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal mengupdate sarana",
      data: null,
    }
  }
}

export async function deleteSarana(id: string) {
  try {
    const result = await saranaService.deleteSarana(id)

  if (result.success) {
      revalidatePath("/admin/manajemen-sarpras")
    }

    return result
  } catch (error) {
    console.error("[deleteSarana]", error)
    return {
      success: false,
      message: "Gagal menghapus sarana",
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
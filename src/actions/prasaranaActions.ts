"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { StatusSarpras } from "@prisma/client";
import * as prasaranaService from "@/service/prasaranaService";
import { createPrasaranaSchema, updatePrasaranaSchema } from "@/lib/validations/sarpras";

// export type { PrasaranaWithImages } from "@/service/prasaranaService";

interface GetPrasaranaOptions {
  status?: StatusSarpras;
}

export async function getAllPrasarana(options?: GetPrasaranaOptions) {
  try {
    const result = await prasaranaService.getAllPrasarana(options);
    return result;
  } catch (error) {
    console.error("[getAllPrasarana]", error);
    return {
      success: false,
      message: "Gagal mengambil data prasarana",
      data: null,
    };
  }
}

export async function getPrasaranaById(id: string) {
  try {
    const result = await prasaranaService.getPrasaranaById(id);
    return result;
  } catch (error) {
    console.error("[getPrasaranaById]", error);
    return {
      success: false,
      message: "Gagal mengambil data prasarana",
      data: null,
    };
  }
}

export async function createPrasarana(data: z.infer<typeof createPrasaranaSchema>) {
  try {
    // Validate input
    const validated = createPrasaranaSchema.parse(data);

    // Create prasarana
    const result = await prasaranaService.createPrasarana(validated);

    if (result.success) {
      revalidatePath("/admin/manajemen-sarpras");
    }

    return result;
  } catch (error) {
    console.error("[createPrasarana]", error);
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => {
        const field = err.path.join('.');
        return `${field}: ${err.message}`;
      }).join('\n');
      
      return {
        success: false,
        message: errorMessages,
        data: null,
      };
    }
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal membuat prasarana",
      data: null,
    };
  }
}

export async function updatePrasarana(id: string, data: z.infer<typeof updatePrasaranaSchema>) {
  try {
    // Validate input
    const validated = updatePrasaranaSchema.parse(data);

    // Update prasarana
    const result = await prasaranaService.updatePrasarana(id, validated);

    if (result.success) {
      revalidatePath("/admin/manajemen-sarpras");
    }

    return result;
  } catch (error) {
    console.error("[updatePrasarana]", error);
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => {
        const field = err.path.join('.');
        return `${field}: ${err.message}`;
      }).join('\n');
      
      return {
        success: false,
        message: errorMessages,
        data: null,
      };
    }
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal mengupdate prasarana",
      data: null,
    };
  }
}

export async function deletePrasarana(id: string) {
  try {
    const result = await prasaranaService.deletePrasarana(id);

    if (result.success) {
      revalidatePath("/admin/manajemen-sarpras");
    }

    return result;
  } catch (error) {
    console.error("[deletePrasarana]", error);
    return {
      success: false,
      message: "Gagal menghapus prasarana",
      data: null,
    };
  }
} 
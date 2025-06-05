"use server";

import { uploadSaranaImage, deleteSaranaImage } from "@/actions/fileActions";
import { SaranaService } from "@/service/saranaService";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { StatusPeminjaman, JenisBarang } from "@prisma/client";

const detailSaranaSchema = z.object({
  nomer_seri: z.string().optional(),
  status: z.nativeEnum(StatusPeminjaman).default(StatusPeminjaman.TERSEDIA),
  lokasi: z.string().optional(),
});

// Schema untuk validasi input
const saranaFormSchema = z.object({
  nama: z.string().min(1, "Nama sarana harus diisi"),
  kategori: z.string().min(1, "Kategori harus dipilih"),
  satuan: z.string().min(1, "Satuan harus dipilih"),
  jenis: z.nativeEnum(JenisBarang),
  stok: z.number().optional(),
  lokasi: z.string().optional(),
  image_url: z.string().optional(),
  image_file: z.any().optional(),
  detailSarana: z.array(detailSaranaSchema).optional(),
}).refine((data) => {
  if (data.jenis === JenisBarang.BERNOMOR) {
    return data.detailSarana && data.detailSarana.length > 0;
  }
  return true;
}, {
  message: "Minimal harus ada 1 detail sarana untuk barang bernomor",
  path: ["detailSarana"],
});

export type SaranaFormData = z.infer<typeof saranaFormSchema>;
export type DetailSaranaFormData = z.infer<typeof detailSaranaSchema>;

interface GetSaranaParams {
  page?: number;
  limit?: number;
  search?: string;
  kategori?: string;
  status?: StatusPeminjaman;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export async function getSarana({
  page = 1,
  limit = 10,
  search = "",
  kategori,
  status,
  sortBy = "nama",
  sortOrder = "asc"
}: GetSaranaParams = {}) {
  try {
    const result = await SaranaService.getAllSarana({
      page,
      limit,
      search,
      kategori,
      status,
      orderBy: {
        field: sortBy as any,
        direction: sortOrder
      }
    });

    return result;
  } catch (error) {
    console.error("Error in getSarana:", error);
    return {
      success: false,
      message: "Gagal mengambil data sarana",
      data: null
    };
  }
}

export async function getKategoriOptions() {
  try {
    const options = await SaranaService.getKategoriOptions();
    return {
      success: true,
      data: options
    };
  } catch (error) {
    console.error("Error in getKategoriOptions:", error);
    return {
      success: false,
      message: "Gagal mengambil data kategori",
      data: []
    };
  }
}

export async function getSatuanOptions() {
  try {
    const options = await SaranaService.getSatuanOptions();
    return {
      success: true,
      data: options
    };
  } catch (error) {
    console.error("Error in getSatuanOptions:", error);
    return {
      success: false,
      message: "Gagal mengambil data satuan",
      data: []
    };
  }
}

export async function createSarana(data: SaranaFormData) {
  try {
    // Validasi input
    const validatedData = saranaFormSchema.parse(data);

    // Handle image upload if there's a new file
    let imageUrl = validatedData.image_url;
    if (validatedData.image_file) {
      try {
        imageUrl = await uploadSaranaImage(validatedData.image_file);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }

    // Update the data with processed image
    const processedData = {
      ...validatedData,
      image_url: imageUrl,
      image_file: undefined, // Remove the file object before saving
      detailSarana: validatedData.jenis === JenisBarang.BERNOMOR ? validatedData.detailSarana : undefined,
    };

    // Create new sarana
    const result = await SaranaService.createSarana(processedData);

    // Revalidate page
    revalidatePath("/admin/manajemen-sarpras");

    return result;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validasi gagal: " + error.errors.map(e => e.message).join(", "),
        data: null
      };
    }

    console.error("Error in createSarana:", error);
    return {
      success: false,
      message: "Gagal membuat sarana",
      data: null
    };
  }
}

export async function updateSarana(id: string, data: Partial<SaranaFormData>) {
  try {
    // Get existing sarana to handle image deletion
    const existingSarana = await SaranaService.getSaranaById(id);
    if (!existingSarana.success || !existingSarana.data) {
      return {
        success: false,
        message: "Sarana tidak ditemukan",
        data: null
      };
    }

    // Handle image upload if there's a new file
    let imageUrl = data.image_url;
    if (data.image_file) {
      try {
        imageUrl = await uploadSaranaImage(data.image_file);
        // Delete old image if it exists
        if (existingSarana.data.sarana[0].image_url) {
          await deleteSaranaImage(existingSarana.data.sarana[0].image_url);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }

    // Update the data with processed image
    const processedData = {
      ...data,
      image_url: imageUrl,
      image_file: undefined, // Remove the file object before saving
      detailSarana: data.jenis === JenisBarang.BERNOMOR ? data.detailSarana : undefined,
    };

    // Update sarana
    const result = await SaranaService.updateSarana(id, processedData);

    // Revalidate page
    revalidatePath("/admin/manajemen-sarpras");

    return result;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validasi gagal: " + error.errors.map(e => e.message).join(", "),
        data: null
      };
    }

    console.error("Error in updateSarana:", error);
    return {
      success: false,
      message: "Gagal memperbarui sarana",
      data: null
    };
  }
}

export async function deleteSarana(id: string) {
  try {
    // Get existing sarana to handle image deletion
    const existingSarana = await SaranaService.getSaranaById(id);
    if (!existingSarana.success || !existingSarana.data) {
      return {
        success: false,
        message: "Sarana tidak ditemukan",
        data: null
      };
    }

    // Delete image if it exists
    if (existingSarana.data.sarana[0].image_url) {
      await deleteSaranaImage(existingSarana.data.sarana[0].image_url);
    }

    // Delete sarana
    const result = await SaranaService.deleteSarana(id);

    // Revalidate page
    revalidatePath("/admin/manajemen-sarpras");

    return result;
  } catch (error) {
    console.error("Error in deleteSarana:", error);
    return {
      success: false,
      message: "Gagal menghapus sarana",
      data: null
    };
  }
}

export async function getSaranaById(id: string) {
  try {
    const result = await SaranaService.getSaranaById(id);
    return result;
  } catch (error) {
    console.error("Error in getSaranaById:", error);
    return {
      success: false,
      message: "Gagal mengambil data sarana",
      data: null
    };
  }
}

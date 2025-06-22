"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { uploadPrasaranaImage, deletePrasaranaImage as deleteImageFile } from "@/actions/fileActions"

// Schema untuk validasi file gambar
const imageFileSchema = z.custom<File>((value) => {
  return value instanceof File
}, "File is required")

export async function addPrasaranaImage(prasaranaId: string, file: File) {
  try {
    const validatedFile = imageFileSchema.parse(file)
    const imageUrl = await uploadPrasaranaImage(validatedFile)

    const image = await prisma.imagePrasarana.create({
      data: {
        prasaranaId,
        image_url: imageUrl,
      },
    })

    return {
      success: true,
      data: image,
      message: "Gambar berhasil ditambahkan",
    }
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan saat menambahkan gambar",
    }
  }
}

export async function deletePrasaranaImage(imageId: string) {
  try {
    const image = await prisma.imagePrasarana.findUnique({
      where: { id: imageId },
    })

    if (!image) {
      return {
        success: false,
        message: "Gambar tidak ditemukan",
      }
    }

    await deleteImageFile(image.image_url)
    await prisma.imagePrasarana.delete({
      where: { id: imageId },
    })

    return {
      success: true,
      message: "Gambar berhasil dihapus",
    }
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan saat menghapus gambar",
    }
  }
} 
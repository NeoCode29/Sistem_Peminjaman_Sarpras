import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createPeminjamanAction } from "@/actions/peminjamanActions";
import { PeminjamanFormData, peminjamanFormSchema } from "@/lib/validations/peminjamanSchema";
import { SarprasPeminjaman } from "@prisma/client";

export const usePeminjamanForm = (userId: string) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: PeminjamanFormData) => {
    try {
      setIsSubmitting(true);

      // Validate form data
      const validatedData = peminjamanFormSchema.parse(data);

      // Convert File to Buffer
      const fileBuffer = Buffer.from(await validatedData.surat_pengajuan.arrayBuffer());

      // Determine sarpras_peminjaman type
      const sarpras_peminjaman = validatedData.prasaranaIds && validatedData.saranaItems 
        ? SarprasPeminjaman.BOTH
        : validatedData.prasaranaIds 
          ? SarprasPeminjaman.PRASARANA 
          : SarprasPeminjaman.SARANA;

      // Submit form
      const result = await createPeminjamanAction(userId, {
        ...validatedData,
        userId,
        surat_pengajuan: fileBuffer,
        surat_pengajuan_name: validatedData.surat_pengajuan.name,
        sarpras_peminjaman,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Pengajuan peminjaman berhasil dibuat");
      router.push("/peminjam/peminjaman");
      router.refresh();

    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Terjadi kesalahan saat membuat pengajuan");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit,
  };
}; 
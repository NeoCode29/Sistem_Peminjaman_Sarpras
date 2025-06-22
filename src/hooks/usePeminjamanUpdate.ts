import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updatePeminjamanAction } from "@/actions/peminjamanActions";
import { UpdatePeminjamanData, updatePeminjamanSchema } from "@/lib/validations/peminjamanSchema";

export const usePeminjamanUpdate = (userId: string, peminjamanId: string) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdate = async (data: UpdatePeminjamanData) => {
    try {
      setIsSubmitting(true);

      // Validate update data
      const validatedData = updatePeminjamanSchema.parse(data);

      // Submit update
      const result = await updatePeminjamanAction(userId, peminjamanId, validatedData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Pengajuan peminjaman berhasil diperbarui");
      router.push("/peminjam/peminjaman");
      router.refresh();

    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Terjadi kesalahan saat memperbarui pengajuan");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleUpdate,
  };
}; 
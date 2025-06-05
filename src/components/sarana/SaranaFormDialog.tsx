"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm, SubmitHandler, Control } from "react-hook-form"
import * as z from "zod"
import { SaranaWithRelations } from "@/service/saranaService"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ImageUpload } from "@/components/sarana/ImageUpload"
import { PlusIcon, TrashIcon, X } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { StatusPeminjaman, JenisBarang } from "@prisma/client"
import { toast } from "sonner"
import { useEffect } from "react"

const detailSaranaSchema = z.object({
  nomer_seri: z.string().optional(),
  status: z.nativeEnum(StatusPeminjaman),
  lokasi: z.string().optional(),
})

type DetailSaranaType = z.infer<typeof detailSaranaSchema>

const formSchema = z.object({
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

type FormData = z.infer<typeof formSchema>;

interface FormFieldProps {
  control: Control<FormData>;
  name: keyof FormData | `detailSarana.${number}.${keyof DetailSaranaType}`;
  label: string;
}

interface SaranaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormData) => Promise<void>;
  initialData?: FormData;
  kategoriOptions: { value: string; label: string }[];
  satuanOptions: { value: string; label: string }[];
}

export function SaranaFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  kategoriOptions,
  satuanOptions,
}: SaranaFormDialogProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      nama: "",
      kategori: "",
      satuan: "",
      jenis: JenisBarang.BERNOMOR,
      stok: 0,
      lokasi: "",
      image_url: "",
      detailSarana: [
        {
          nomer_seri: "",
          status: StatusPeminjaman.TERSEDIA,
          lokasi: "",
        },
      ],
    },
  })

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset()
    }
  }, [open, form])

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset(initialData)
    }
  }, [initialData, form])

  const { fields, append, remove } = useFieldArray({
    name: "detailSarana",
    control: form.control,
  })

  const onFormSubmit = async (values: FormData) => {
    try {
      await onSubmit(values);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan data",
      });
    }
  }

  const handleAddDetail = () => {
    append({
      nomer_seri: "",
      status: StatusPeminjaman.TERSEDIA,
      lokasi: "",
    } as DetailSaranaType);
  }

  const handleRemoveDetail = (index: number) => {
    remove(index);
  }

  const watchJenis = form.watch("jenis")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] flex flex-col gap-0 p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>
            {initialData ? "Edit Sarana" : "Tambah Sarana"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Edit informasi sarana yang sudah ada"
              : "Tambah sarana baru ke dalam sistem"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)}>
            <ScrollArea className="h-[calc(100vh-300px)] px-6">
              <div className="grid gap-4 pb-4">
                <FormField
                  control={form.control}
                  name="nama"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Sarana</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nama sarana" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="kategori"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kategori</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {kategoriOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="satuan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Satuan</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih satuan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {satuanOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="jenis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jenis Barang</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih jenis barang" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={JenisBarang.BERNOMOR}>
                              Barang Bernomor
                            </SelectItem>
                            <SelectItem value={JenisBarang.TIDAK_BERNOMOR}>
                              Barang Tidak Bernomor
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchJenis === JenisBarang.TIDAK_BERNOMOR && (
                    <FormField
                      control={form.control}
                      name="stok"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stok</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Masukkan jumlah stok"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="lokasi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lokasi</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Masukkan lokasi"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gambar</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value}
                          onChange={field.onChange}
                          onRemove={() => field.onChange("")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                {watchJenis === JenisBarang.BERNOMOR && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Detail Item</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddDetail}
                      >
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Tambah Item
                      </Button>
                    </div>

                    <ScrollArea className="h-[400px] rounded-md border p-4">
                      <div className="space-y-8">
                        {fields.map((field, index) => (
                          <div key={field.id} className="relative space-y-4">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium">Item #{index + 1}</h5>
                              {fields.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleRemoveDetail(index)}
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              )}
                            </div>

                            <div className="grid gap-4">
                              <FormField
                                control={form.control}
                                name={`detailSarana.${index}.nomer_seri` as const}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Nomor Seri</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Masukkan nomor seri (opsional)"
                                        {...field}
                                        value={field.value || ""}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`detailSarana.${index}.status` as const}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Pilih status" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value={StatusPeminjaman.TERSEDIA}>
                                          Tersedia
                                        </SelectItem>
                                        <SelectItem value={StatusPeminjaman.DIPINJAM}>
                                          Dipinjam
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`detailSarana.${index}.lokasi` as const}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Lokasi</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Masukkan lokasi"
                                        {...field}
                                        value={field.value || ""}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            {index < fields.length - 1 && (
                              <Separator className="mt-4" />
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </ScrollArea>

            <DialogFooter className="p-6 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit">
                {initialData ? "Simpan Perubahan" : "Tambah Sarana"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 
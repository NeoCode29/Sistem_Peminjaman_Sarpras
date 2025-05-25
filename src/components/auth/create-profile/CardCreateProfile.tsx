"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { createProfile } from "@/app/auth/create-profile/actions"
import { toast } from "sonner"
import { useState } from "react"
import { Profile } from "@/service/profileService"

const formSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nama harus diisi"),
  email: z.string().email("Format email tidak valid"),
  nomor_hp: z.string().min(1, "Nomor HP harus diisi"),
  posisi: z.enum(["mahasiswa", "pegawai"]),
  jenis_kelamin: z.string().min(1, "Jenis kelamin harus dipilih"),
  mahasiswa: z.object({
    nim: z.string().min(1, "NIM harus diisi"),
    jurusan: z.string().min(1, "Jurusan harus diisi"),
    prodi: z.string().min(1, "Program studi harus diisi"),
  }).optional().refine(
    (data) => {
      // If posisi is mahasiswa, then mahasiswa data is required
      return data !== undefined;
    },
    {
      message: "Data mahasiswa harus diisi",
      path: ["mahasiswa"],
    }
  ),
  pegawai: z.object({
    nik: z.string().min(1, "NIK harus diisi"),
    unit_pegawai: z.string().min(1, "Unit pegawai harus diisi"),
  }).optional().refine(
    (data) => {
      // If posisi is pegawai, then pegawai data is required
      return data !== undefined;
    },
    {
      message: "Data pegawai harus diisi",
      path: ["pegawai"],
    }
  ),
}).refine(
  (data) => {
    if (data.posisi === "mahasiswa") {
      return data.mahasiswa !== undefined;
    }
    if (data.posisi === "pegawai") {
      return data.pegawai !== undefined;
    }
    return true;
  },
  {
    message: "Data harus diisi sesuai dengan posisi yang dipilih",
    path: ["posisi"],
  }
);

type FormValues = {
  id: string;
  name: string;
  email: string;
  nomor_hp: string;
  posisi: "mahasiswa" | "pegawai";
  jenis_kelamin: string;
  mahasiswa?: {
    nim: string;
    jurusan: string;
    prodi: string;
  };
  pegawai?: {
    nik: string;
    unit_pegawai: string;
  };
}

interface CardCreateProfileProps {
  userId: string
  name: string
  email: string
}

const CardCreateProfile = ({ userId, name, email }: CardCreateProfileProps) => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: userId,
      name: name,
      email: email,
      nomor_hp: "",
      posisi: "mahasiswa",
      jenis_kelamin: "",
      mahasiswa: {
        nim: "",
        jurusan: "",
        prodi: "",
      },
      pegawai: {
        nik: "",
        unit_pegawai: "",
      },
    },
  })

  const position = form.watch("posisi")

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const values = form.getValues();
    
    try {
      setIsSubmitting(true);
      
      // Validate and prepare data based on position
      const submissionData = {
        ...values,
        mahasiswa: values.posisi === "mahasiswa" 
          ? values.mahasiswa 
          : { nim: "", jurusan: "", prodi: "" },
        pegawai: values.posisi === "pegawai" 
          ? values.pegawai 
          : { nik: "", unit_pegawai: "" }
      };

      console.log("Submission data:", submissionData);

      const result = await createProfile(submissionData as Profile);
      console.log("Profile creation result:", result);

      if (result.error) {
        toast.error("Error", {
          description: result.error
        });
        return;
      }

      toast.success("Berhasil", {
        description: "Profil berhasil dibuat"
      });
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error", {
        description: "Terjadi kesalahan saat menyimpan profil"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-[95%] sm:w-[90%] md:w-[650px] max-w-full mx-auto shadow-lg">
      <CardHeader className="text-center rounded-t-lg px-4 py-5 sm:px-6">
        <CardTitle className="text-xl sm:text-2xl font-bold">Buat Profil</CardTitle>
        <p className="text-xs sm:text-sm text-gray-500">
          Silakan lengkapi profil Anda untuk melanjutkan.
        </p>
        <Separator className="mt-4" />
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-6">
            <FormField
              control={form.control}
              name="posisi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Siapa anda?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => {
                        field.onChange(value)
                        // Reset the other type's fields when switching
                        if (value === "mahasiswa") {
                          form.setValue("pegawai", { nik: "", unit_pegawai: "" })
                        } else {
                          form.setValue("mahasiswa", { nim: "", jurusan: "", prodi: "" })
                        }
                      }}
                      className="grid grid-cols-2 gap-2"
                    >
                      <FormItem>
                        <FormControl className="hidden">   
                          <RadioGroupItem value="mahasiswa" id="mahasiswa"/>
                        </FormControl>
                        <FormLabel htmlFor="mahasiswa">
                          <Card className={`p-3 rounded-sm w-full ${field.value === "mahasiswa" ? "bg-blue-100 border-blue-400" : ""}`}>
                            <Image src="/icons/mahasiswa.png" alt="Ikon Mahasiswa" width={40} height={40} />
                            <p>Mahasiswa</p>
                          </Card>
                        </FormLabel>
                      </FormItem>
                      <FormItem>
                        <FormControl className="hidden">   
                          <RadioGroupItem value="pegawai" id="pegawai"/>
                        </FormControl>
                        <FormLabel htmlFor="pegawai">
                          <Card className={`p-3 rounded-sm w-full ${field.value === "pegawai" ? "bg-blue-100 border-blue-400" : ""}`}>
                            <Image src="/icons/pegawai.png" alt="Ikon Pegawai" width={40} height={40} />
                            <p>Pegawai</p>
                          </Card>
                        </FormLabel>
                      </FormItem>

                    </RadioGroup>
                  </FormControl>
                  {/* <RadioGroup
                    onValueChange={(value) => {
                      field.onChange(value)
                      // Reset the other type's fields when switching
                      if (value === "mahasiswa") {
                        form.setValue("pegawai", { nip: "", unit_pegawai: "" })
                      } else {
                        form.setValue("mahasiswa", { nim: "", jurusan: "", prodi: "" })
                      }
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih posisi" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                      <SelectItem value="pegawai">Pegawai</SelectItem>
                    </SelectContent>
                  </RadioGroup>
                  <FormMessage /> */}
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama lengkap" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nomor_hp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor HP</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nomor HP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jenis_kelamin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Kelamin</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis kelamin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="L">Laki-laki</SelectItem>
                        <SelectItem value="P">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {position === "mahasiswa" && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="mahasiswa.nim"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIM</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan NIM" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mahasiswa.jurusan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jurusan</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan jurusan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mahasiswa.prodi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Program Studi</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan program studi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {position === "pegawai" && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="pegawai.nik"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIK</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan NIK" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pegawai.unit_pegawai"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Pegawai</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan unit pegawai" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <Button  
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Profil"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default CardCreateProfile

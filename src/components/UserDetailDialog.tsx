import React from "react";
import { User, UserRole } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  GraduationCap,
  Briefcase,
  Shield,
  UserCheck,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  CheckCircle,
  User as UserIcon,
  Clock,
} from "lucide-react";

/**
 * Dialog component for displaying detailed user information
 * Used by: Admin
 * Purpose: Show comprehensive user profile including personal data, role, position, punishment status, and account info
 */
interface UserDetailDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * UserDetailDialog Component
 * Used by: Admin
 * Purpose: Modal dialog displaying comprehensive user information with modern UI
 * Features: Profile section, contact info, student/staff data, punishment status, account history
 * Data Access: Uses type assertion to access relational data (mahasiswa, pegawai)
 */
export function UserDetailDialog({ user, isOpen, onClose }: UserDetailDialogProps) {
  if (!user) return null;

  const isBlocked = user.due_blocked && new Date(user.due_blocked) > new Date();
  const daysRemaining = isBlocked 
    ? Math.ceil((new Date(user.due_blocked!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Tidak tersedia";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <UserIcon className="h-5 w-5 text-blue-600" />
            </div>
            Detail Pengguna
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-8">
          {/* Profile Section */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 border border-gray-200/50 shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
            <div className="relative p-6">
              <div className="flex items-start gap-6">
                <div className="relative">
                  <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
                    <AvatarImage src={user.image || undefined} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl font-semibold">
                      {user.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                    <div className="h-2 w-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-gray-900">{user.name || "Tanpa Nama"}</h3>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{user.email || "Email tidak tersedia"}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Role Badge */}
                    <Badge 
                      variant={user.role === "ADMIN" ? "destructive" : "secondary"}
                      className="px-3 py-1 font-medium shadow-sm"
                    >
                      {user.role === "ADMIN" ? (
                        <div className="flex items-center gap-1.5">
                          <Shield className="h-3.5 w-3.5" />
                          Administrator
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="h-3.5 w-3.5" />
                          Peminjam
                        </div>
                      )}
                    </Badge>
                    
                    {/* Position Badge */}
                    {user.position && (
                      <Badge variant="outline" className="px-3 py-1 font-medium border-2 shadow-sm">
                        {user.position === "mahasiswa" ? (
                          <div className="flex items-center gap-1.5">
                            <GraduationCap className="h-3.5 w-3.5 text-blue-600" />
                            <span className="text-blue-700">Mahasiswa</span>
                          </div>
                        ) : user.position === "pegawai" ? (
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="h-3.5 w-3.5 text-green-600" />
                            <span className="text-green-700">Pegawai</span>
                          </div>
                        ) : (
                          user.position
                        )}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h4 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Phone className="h-4 w-4 text-blue-600" />
                </div>
                Informasi Kontak
              </h4>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">Email</p>
                    <p className="font-semibold text-gray-900 break-all">{user.email || "Tidak tersedia"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">No. Telepon</p>
                    <p className="font-mono font-semibold text-gray-900">{user.number_phone || "Tidak tersedia"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Data Mahasiswa/Pegawai */}
          {user.position && (
            <div className="space-y-4">
              {user.position === "mahasiswa" ? (
                <>
                  <h4 className="text-lg font-semibold flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    Data Mahasiswa
                  </h4>
                  <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-sm">
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(user as any).mahasiswa?.nim && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-blue-700">
                          <GraduationCap className="h-4 w-4" />
                          NIM
                        </div>
                        <p className="font-mono text-blue-900">{(user as any).mahasiswa.nim}</p>
                      </div>
                    )}
                    {(user as any).mahasiswa?.jurusanJurusan?.nama && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-blue-700">
                          <GraduationCap className="h-4 w-4" />
                          Jurusan
                        </div>
                        <p className="font-medium text-blue-900">{(user as any).mahasiswa.jurusanJurusan.nama}</p>
                      </div>
                    )}
                    {(user as any).mahasiswa?.prodiProdi?.nama && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-blue-700">
                          <GraduationCap className="h-4 w-4" />
                          Program Studi
                        </div>
                        <p className="font-medium text-blue-900">{(user as any).mahasiswa.prodiProdi.nama}</p>
                      </div>
                    )}
                    {(user as any).mahasiswa?.ormawa && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-blue-700">
                          <UserIcon className="h-4 w-4" />
                          Organisasi Mahasiswa
                        </div>
                        <p className="font-medium text-blue-900">{(user as any).mahasiswa.ormawa}</p>
                      </div>
                    )}
                      {!(user as any).mahasiswa?.nim && !(user as any).mahasiswa?.jurusanJurusan?.nama && !(user as any).mahasiswa?.prodiProdi?.nama && !(user as any).mahasiswa?.ormawa && (
                        <div className="col-span-full text-center text-blue-600 italic">
                          Data mahasiswa belum lengkap
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : user.position === "pegawai" ? (
                <>
                  <h4 className="text-lg font-semibold flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-green-600" />
                    Data Pegawai
                  </h4>
                  <div className="rounded-lg border border-green-200 bg-gradient-to-br from-green-50 to-green-100/50 shadow-sm">
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(user as any).pegawai?.nip && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-green-700">
                          <Briefcase className="h-4 w-4" />
                          NIP
                        </div>
                        <p className="font-mono text-green-900">{(user as any).pegawai.nip}</p>
                      </div>
                    )}
                    {(user as any).pegawai?.jabatan && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-green-700">
                          <Briefcase className="h-4 w-4" />
                          Jabatan
                        </div>
                        <p className="font-medium text-green-900">{(user as any).pegawai.jabatan}</p>
                      </div>
                    )}
                    {(user as any).pegawai?.unit_kerja && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-green-700">
                          <Briefcase className="h-4 w-4" />
                          Unit Kerja
                        </div>
                        <p className="font-medium text-green-900">{(user as any).pegawai.unit_kerja}</p>
                      </div>
                    )}
                      {!(user as any).pegawai?.nip && !(user as any).pegawai?.jabatan && !(user as any).pegawai?.unit_kerja && (
                        <div className="col-span-full text-center text-green-600 italic">
                          Data pegawai belum lengkap
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          )}

          <Separator />

          {/* Status Hukuman */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h4 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                </div>
                Status Hukuman
              </h4>
            </div>
            <div className="p-6">
              <div className="p-4 rounded-lg border bg-gray-50">
              {isBlocked ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Sedang Dihukum
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Berakhir pada:</span>
                      <span className="font-medium">{formatDate(user.due_blocked)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sisa waktu:</span>
                      <span className="font-medium text-red-600">{daysRemaining} hari</span>
                    </div>
                    {(user as any).alasan_hukuman && (
                      <div className="pt-2 border-t">
                        <span className="text-gray-600 text-xs">Alasan:</span>
                        <p className="mt-1 text-sm">{(user as any).alasan_hukuman}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Normal
                  </Badge>
                  <span className="text-sm text-gray-600">Tidak ada hukuman aktif</span>
                </div>
              )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Account Information */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h4 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-4 w-4 text-purple-600" />
                </div>
                Informasi Akun
              </h4>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">Terdaftar</p>
                    <p className="font-semibold text-gray-900">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">Terakhir Diperbarui</p>
                    <p className="font-semibold text-gray-900">{formatDate(user.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
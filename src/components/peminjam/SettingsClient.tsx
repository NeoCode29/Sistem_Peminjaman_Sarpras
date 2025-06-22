"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Edit, Mail, Phone, Building, Calendar, Save, X } from "lucide-react";
import { toast } from "sonner";

interface SettingsClientProps {
  session: any;
}

interface ProfileData {
  name: string;
  email: string;
  number_phone?: string;
  mahasiswa?: {
    nim: string;
    jurusanId?: string;
    prodiId?: string;
    jurusanJurusan?: {
      nama: string;
    };
    prodiProdi?: {
      nama: string;
    };
  } | null;
  pegawai?: {
    nomer_induk: string;
    unit_pegawai: string;
  } | null;
}

interface JurusanData {
  id: string;
  nama: string;
}

interface ProdiData {
  id: string;
  nama: string;
  jurusanId: string;
}

export function SettingsClient({ session }: SettingsClientProps) {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [jurusanList, setJurusanList] = useState<JurusanData[]>([]);
  const [prodiList, setProdiList] = useState<ProdiData[]>([]);
  const [editForm, setEditForm] = useState({
    name: "",
    number_phone: "",
    // Mahasiswa fields
    nim: "",
    jurusanId: "",
    prodiId: "",
    // Pegawai fields
    nomer_induk: "",
    unit_pegawai: ""
  });

  useEffect(() => {
    fetchProfileData();
    if (session.user.role === "PEMINJAM") {
      fetchJurusan();
    }
  }, []);

  // Fetch prodi when jurusan changes
  useEffect(() => {
    if (editForm.jurusanId) {
      fetchProdi(editForm.jurusanId);
    } else {
      setProdiList([]);
      setEditForm(prev => ({ ...prev, prodiId: "" }));
    }
  }, [editForm.jurusanId]);

  const fetchJurusan = async () => {
    try {
      const response = await fetch('/api/jurusan');
      if (response.ok) {
        const data = await response.json();
        setJurusanList(data);
      }
    } catch (error) {
      console.error('Error fetching jurusan:', error);
    }
  };

  const fetchProdi = async (jurusanId: string) => {
    try {
      const response = await fetch(`/api/prodi?jurusanId=${jurusanId}`);
      if (response.ok) {
        const data = await response.json();
        setProdiList(data);
      }
    } catch (error) {
      console.error('Error fetching prodi:', error);
    }
  };

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/profile?userId=${session.user.id}`);
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
        
        // Set form data for editing
        setEditForm({
          name: data.name || "",
          number_phone: data.number_phone || "",
          nim: data.mahasiswa?.nim || "",
          jurusanId: data.mahasiswa?.jurusanId || "",
          prodiId: data.mahasiswa?.prodiId || "",
          nomer_induk: data.pegawai?.nomer_induk || "",
          unit_pegawai: data.pegawai?.unit_pegawai || ""
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Gagal memuat data profil');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    setSaving(true);
    try {
      const payload = {
        name: editForm.name,
        number_phone: editForm.number_phone,
        ...(profileData?.mahasiswa && {
          mahasiswa: {
            nim: editForm.nim,
            jurusanId: editForm.jurusanId,
            prodiId: editForm.prodiId,
          }
        }),
        ...(profileData?.pegawai && {
          pegawai: {
            nomer_induk: editForm.nomer_induk,
            unit_pegawai: editForm.unit_pegawai
          }
        })
      };

      const response = await fetch(`/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setProfileData(updatedData);
        setEditDialogOpen(false);
        toast.success('Profil berhasil diperbarui');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Gagal memperbarui profil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Terjadi kesalahan saat memperbarui profil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-500">
          Gagal memuat data profil
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profil Saya</TabsTrigger>
          <TabsTrigger value="account">Pengaturan Akun</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="flex justify-between items-center p-6 border-b">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Informasi Profil</h3>
              </div>
              <Button 
                onClick={() => setEditDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Profil
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Nama</Label>
                  <p className="text-base text-gray-900">{profileData.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="text-base text-gray-900 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {profileData.email}
                  </p>
                </div>
                {profileData.number_phone && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">No. Telepon</Label>
                    <p className="text-base text-gray-900 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {profileData.number_phone}
                    </p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium text-gray-500">Tipe Akun</Label>
                  <Badge variant="secondary">
                    {profileData.mahasiswa ? 'Mahasiswa' : 'Pegawai'}
                  </Badge>
                </div>
              </div>

              {profileData.mahasiswa && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Data Mahasiswa
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">NIM</Label>
                      <p className="text-base text-gray-900">{profileData.mahasiswa.nim}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Jurusan</Label>
                      <p className="text-base text-gray-900">{profileData.mahasiswa.jurusanJurusan?.nama || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Program Studi</Label>
                      <p className="text-base text-gray-900">{profileData.mahasiswa.prodiProdi?.nama || '-'}</p>
                    </div>
                  </div>
                </div>
              )}

              {profileData.pegawai && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Data Pegawai
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">NIP/NDK/NIDN</Label>
                      <p className="text-base text-gray-900">{profileData.pegawai.nomer_induk}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Unit Kerja</Label>
                      <p className="text-base text-gray-900">{profileData.pegawai.unit_pegawai}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Pengaturan Akun</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600">
                Pengaturan akun lanjutan akan tersedia dalam pembaruan mendatang.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Profil</DialogTitle>
            <DialogDescription>
              Perbarui informasi profil Anda. Email tidak dapat diubah.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Basic Info */}
            <div className="space-y-4">
              <h4 className="font-semibold">Informasi Dasar</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Nama</Label>
                  <Input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={profileData.email}
                    disabled
                    className="bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
                </div>
                <div>
                  <Label htmlFor="edit-phone">No. Telepon</Label>
                  <Input
                    id="edit-phone"
                    value={editForm.number_phone}
                    onChange={(e) => setEditForm(prev => ({ ...prev, number_phone: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Mahasiswa Fields */}
            {profileData.mahasiswa && (
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-semibold">Data Mahasiswa</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-nim">NIM</Label>
                    <Input
                      id="edit-nim"
                      value={editForm.nim}
                      onChange={(e) => setEditForm(prev => ({ ...prev, nim: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-jurusan">Jurusan</Label>
                    <Select 
                      value={editForm.jurusanId} 
                      onValueChange={(value) => setEditForm(prev => ({ ...prev, jurusanId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jurusan" />
                      </SelectTrigger>
                      <SelectContent>
                        {jurusanList.map(jurusan => (
                          <SelectItem key={jurusan.id} value={jurusan.id}>
                            {jurusan.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-prodi">Program Studi</Label>
                    <Select 
                      value={editForm.prodiId} 
                      onValueChange={(value) => setEditForm(prev => ({ ...prev, prodiId: value }))}
                      disabled={!editForm.jurusanId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih program studi" />
                      </SelectTrigger>
                      <SelectContent>
                        {prodiList.map(prodi => (
                          <SelectItem key={prodi.id} value={prodi.id}>
                            {prodi.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Pegawai Fields */}
            {profileData.pegawai && (
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-semibold">Data Pegawai</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-nomer-induk">NIP/NDK/NIDN</Label>
                    <Input
                      id="edit-nomer-induk"
                      value={editForm.nomer_induk}
                      onChange={(e) => setEditForm(prev => ({ ...prev, nomer_induk: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-unit">Unit Kerja</Label>
                    <Input
                      id="edit-unit"
                      value={editForm.unit_pegawai}
                      onChange={(e) => setEditForm(prev => ({ ...prev, unit_pegawai: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              <X className="w-4 h-4 mr-2" />
              Batal
            </Button>
            <Button onClick={handleEditSubmit} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
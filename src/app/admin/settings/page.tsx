"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { 
  getSettings, 
  updateHariHukuman, 
  updateMinimalHariPengajuan,
  updateUrlFileFormPeminjaman,
  updateUrlFormPeminjaman,
  updateNomerHandphoneAdmin
} from "@/actions/settingActions";
import { toast } from "sonner";
import { Loader2, ExternalLink, Phone, FileText, Link } from "lucide-react";

export default function SettingsPage() {
  const [minimalHariPengajuan, setMinimalHariPengajuan] = useState<number>(3);
  const [hariHukuman, setHariHukuman] = useState<number>(7);
  const [urlFileFormPeminjaman, setUrlFileFormPeminjaman] = useState<string>("");
  const [urlFormPeminjaman, setUrlFormPeminjaman] = useState<string>("");
  const [nomerHandphoneAdmin, setNomerHandphoneAdmin] = useState<string>("");
  const [originalValues, setOriginalValues] = useState({
    minimalHariPengajuan: 3,
    hariHukuman: 7,
    urlFileFormPeminjaman: "",
    urlFormPeminjaman: "",
    nomerHandphoneAdmin: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const result = await getSettings();
    if (result.success && result.data) {
      setMinimalHariPengajuan(result.data.minimal_hari_pengajuan);
      setHariHukuman(result.data.hari_hukuman);
      setUrlFileFormPeminjaman(result.data.url_file_form_peminjaman);
      setUrlFormPeminjaman(result.data.url_form_peminjaman);
      setNomerHandphoneAdmin(result.data.nomer_handphone_admin);
      setOriginalValues({
        minimalHariPengajuan: result.data.minimal_hari_pengajuan,
        hariHukuman: result.data.hari_hukuman,
        urlFileFormPeminjaman: result.data.url_file_form_peminjaman,
        urlFormPeminjaman: result.data.url_form_peminjaman,
        nomerHandphoneAdmin: result.data.nomer_handphone_admin,
      });
    }
  };

  const handleSaveMinimalHari = async () => {
    setIsLoading(true);
    const result = await updateMinimalHariPengajuan(minimalHariPengajuan);
    if (result.success) {
      toast.success("Berhasil mengupdate minimal hari pengajuan");
      setOriginalValues(prev => ({
        ...prev,
        minimalHariPengajuan,
      }));
    } else {
      toast.error(result.error || "Gagal mengupdate minimal hari pengajuan");
    }
    setIsLoading(false);
  };

  const handleSaveHariHukuman = async () => {
    setIsLoading(true);
    const result = await updateHariHukuman(hariHukuman);
    if (result.success) {
      toast.success("Berhasil mengupdate hari hukuman");
      setOriginalValues(prev => ({
        ...prev,
        hariHukuman,
      }));
    } else {
      toast.error(result.error || "Gagal mengupdate hari hukuman");
    }
    setIsLoading(false);
  };

  const handleSaveUrlFileForm = async () => {
    setIsLoading(true);
    const result = await updateUrlFileFormPeminjaman(urlFileFormPeminjaman);
    if (result.success) {
      toast.success("Berhasil mengupdate URL file form peminjaman");
      setOriginalValues(prev => ({
        ...prev,
        urlFileFormPeminjaman,
      }));
    } else {
      toast.error(result.error || "Gagal mengupdate URL file form peminjaman");
    }
    setIsLoading(false);
  };

  const handleSaveUrlForm = async () => {
    setIsLoading(true);
    const result = await updateUrlFormPeminjaman(urlFormPeminjaman);
    if (result.success) {
      toast.success("Berhasil mengupdate URL form peminjaman");
      setOriginalValues(prev => ({
        ...prev,
        urlFormPeminjaman,
      }));
    } else {
      toast.error(result.error || "Gagal mengupdate URL form peminjaman");
    }
    setIsLoading(false);
  };

  const handleSaveNomerHandphone = async () => {
    setIsLoading(true);
    const result = await updateNomerHandphoneAdmin(nomerHandphoneAdmin);
    if (result.success) {
      toast.success("Berhasil mengupdate nomor handphone admin");
      setOriginalValues(prev => ({
        ...prev,
        nomerHandphoneAdmin,
      }));
    } else {
      toast.error(result.error || "Gagal mengupdate nomor handphone admin");
    }
    setIsLoading(false);
  };

  const isMinimalHariChanged = minimalHariPengajuan !== originalValues.minimalHariPengajuan;
  const isHariHukumanChanged = hariHukuman !== originalValues.hariHukuman;
  const isUrlFileFormChanged = urlFileFormPeminjaman !== originalValues.urlFileFormPeminjaman;
  const isUrlFormChanged = urlFormPeminjaman !== originalValues.urlFormPeminjaman;
  const isNomerHandphoneChanged = nomerHandphoneAdmin !== originalValues.nomerHandphoneAdmin;

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <div className="grid gap-6">
        {/* Pengaturan Umum */}
        <Card>
          <CardHeader>
            <CardTitle>Pengaturan Umum</CardTitle>
            <CardDescription>
              Konfigurasi pengaturan umum aplikasi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-1">
                  <label htmlFor="minimalHari" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Minimal Hari Pengajuan Sebelum Acara
                  </label>
                  <Input
                    id="minimalHari"
                    type="number"
                    value={minimalHariPengajuan}
                    onChange={(e) => setMinimalHariPengajuan(parseInt(e.target.value))}
                    className="max-w-[200px]"
                    min={1}
                  />
                  <p className="text-[0.8rem] text-muted-foreground">
                    Minimal berapa hari sebelum acara peminjaman harus diajukan
                  </p>
                </div>
                <Button
                  onClick={handleSaveMinimalHari}
                  disabled={!isMinimalHariChanged || isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan"}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-1">
                  <label htmlFor="hariHukuman" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Hari Hukuman
                  </label>
                  <Input
                    id="hariHukuman"
                    type="number"
                    value={hariHukuman}
                    onChange={(e) => setHariHukuman(parseInt(e.target.value))}
                    className="max-w-[200px]"
                    min={1}
                  />
                  <p className="text-[0.8rem] text-muted-foreground">
                    Berapa hari user akan diblokir jika terlambat mengembalikan
                  </p>
                </div>
                <Button
                  onClick={handleSaveHariHukuman}
                  disabled={!isHariHukumanChanged || isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pengaturan Formulir */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Pengaturan Formulir
            </CardTitle>
            <CardDescription>
              URL untuk file form dan form peminjaman
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-1">
                  <label htmlFor="urlFileForm" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    URL File Form Peminjaman
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="urlFileForm"
                      type="url"
                      value={urlFileFormPeminjaman}
                      onChange={(e) => setUrlFileFormPeminjaman(e.target.value)}
                      placeholder="https://drive.google.com/file/..."
                    />
                    {urlFileFormPeminjaman && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(urlFileFormPeminjaman, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-[0.8rem] text-muted-foreground">
                    URL untuk file form peminjaman yang dapat diunduh oleh peminjam
                  </p>
                </div>
                <Button
                  onClick={handleSaveUrlFileForm}
                  disabled={!isUrlFileFormChanged || isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan"}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-1">
                  <label htmlFor="urlForm" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    URL Form Peminjaman Online
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="urlForm"
                      type="url"
                      value={urlFormPeminjaman}
                      onChange={(e) => setUrlFormPeminjaman(e.target.value)}
                      placeholder="https://forms.google.com/..."
                    />
                    {urlFormPeminjaman && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(urlFormPeminjaman, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-[0.8rem] text-muted-foreground">
                    URL untuk form peminjaman online (Google Forms, dll)
                  </p>
                </div>
                <Button
                  onClick={handleSaveUrlForm}
                  disabled={!isUrlFormChanged || isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pengaturan Kontak */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Pengaturan Kontak
            </CardTitle>
            <CardDescription>
              Informasi kontak admin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-1">
                  <label htmlFor="nomerHandphone" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Nomor Handphone Admin
                  </label>
                  <Input
                    id="nomerHandphone"
                    type="tel"
                    value={nomerHandphoneAdmin}
                    onChange={(e) => setNomerHandphoneAdmin(e.target.value)}
                    placeholder="08123456789"
                  />
                  <p className="text-[0.8rem] text-muted-foreground">
                    Nomor handphone admin yang dapat dihubungi untuk informasi lebih lanjut
                  </p>
                </div>
                <Button
                  onClick={handleSaveNomerHandphone}
                  disabled={!isNomerHandphoneChanged || isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}




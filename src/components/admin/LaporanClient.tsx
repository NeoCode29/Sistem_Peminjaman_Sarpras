"use client";

import { useState, useEffect } from "react";
import { format, addMonths, subMonths } from "date-fns";
import { id } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ChevronLeft, 
  ChevronRight, 
  Download,
  FileText,
  Calendar
} from "lucide-react";
import { StatusPeminjaman, StatusPengajuan } from "@prisma/client";
import { toast } from "sonner";
// import { getLaporanPeminjamanAction } from "@/actions/laporanActions";
import type { LaporanPeminjaman } from "@/service/laporanService";

interface LaporanClientProps {
  initialData: LaporanPeminjaman[];
}

export function LaporanClient({ initialData }: LaporanClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [data, setData] = useState<LaporanPeminjaman[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch data when month changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        const response = await fetch(`/api/laporan?date=${currentDate.toISOString()}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          setData(result.data);
          setCurrentPage(1); // Reset to first page when data changes
        } else {
          toast.error(result.message || "Gagal mengambil data laporan");
        }
      } catch (error) {
        console.error("Error fetching laporan:", error);
        toast.error("Terjadi kesalahan saat mengambil data laporan");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentDate]);

  // Calculate pagination
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1); // Reset to first page
  };

  const handlePrevMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };

  const getStatusBadge = (status: StatusPeminjaman, statusPengajuan: StatusPengajuan) => {
    if (statusPengajuan === "PENGAJUAN_DITOLAK") {
      return <Badge variant="destructive">Ditolak</Badge>;
    }
    
    switch (status) {
      case "DALAM_PROSES":
        return <Badge variant="secondary">Dalam Proses</Badge>;
      case "DITERIMA":
        return <Badge variant="default" className="bg-blue-500">Diterima</Badge>;
      case "SELESAI":
        return <Badge variant="default" className="bg-green-500">Selesai</Badge>;
      case "DIBATALKAN":
        return <Badge variant="destructive">Dibatalkan</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusText = (status: StatusPeminjaman, statusPengajuan: StatusPengajuan) => {
    if (statusPengajuan === "PENGAJUAN_DITOLAK") {
      return "Ditolak";
    }
    
    switch (status) {
      case "DALAM_PROSES": return "Dalam Proses";
      case "DITERIMA": return "Diterima";
      case "SELESAI": return "Selesai";
      case "DIBATALKAN": return "Dibatalkan";
      default: return status;
    }
  };

  const formatPeminjamInfo = (item: LaporanPeminjaman) => {
    // Prioritas: nama user atau nama dari email
    const nama = item.user.name || item.user.email?.split('@')[0] || 'Unknown';
    
    // Jika ada data mahasiswa
    if (item.user.mahasiswa) {
      const nim = item.user.mahasiswa.nim || '-';
      const jurusan = item.user.mahasiswa.jurusanJurusan?.nama || '-';
      const prodi = item.user.mahasiswa.prodiProdi?.nama || '-';
      
      return {
        nama,
        detail: `NIM: ${nim}`,
        jurusan,
        prodi,
        type: 'mahasiswa'
      };
    }
    
    // Jika ada data pegawai
    if (item.user.pegawai) {
      const nomorInduk = item.user.pegawai.nomer_induk || '-';
      const unitPegawai = item.user.pegawai.unit_pegawai || item.unit_pegawai || '-';
      
      return {
        nama,
        detail: `NIP: ${nomorInduk}`,
        jurusan: unitPegawai,
        prodi: '-',
        type: 'pegawai'
      };
    }
    
    // Fallback jika tidak ada data mahasiswa atau pegawai
    const organisasi = item.ormawa?.nama || item.unit_pegawai || '-';
    return {
      nama,
      detail: organisasi !== '-' ? `Organisasi: ${organisasi}` : '-',
      jurusan: '-',
      prodi: '-',
      type: 'lainnya'
    };
  };

  const downloadPDF = async () => {
    try {
      // Dynamic import untuk jsPDF
      const { default: jsPDF } = await import('jspdf');

      // Create new PDF document in landscape mode
      const doc = new jsPDF('landscape', 'mm', 'a4');
      
      // Helper function untuk truncate text
      const truncateText = (text: string, maxLength: number): string => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
      };

      // Helper function untuk draw header
      const drawHeader = (yPosition: number) => {
        const headerY = yPosition;
        let headerX = 20;
        
        // Draw header background
        doc.setFillColor(34, 197, 94); // Green background
        doc.rect(20, headerY, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
        
        // Draw header borders dan text
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.setTextColor(255, 255, 255); // White text
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        
        headers.forEach((header, index) => {
          // Draw header cell border (hitam)
          doc.rect(headerX, headerY, colWidths[index], rowHeight, 'S');
          // Draw header text - centered vertically
          doc.text(header, headerX + 2, headerY + 6);
          headerX += colWidths[index];
        });
        
        return headerY + rowHeight;
      };
      
      // Add title
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text('LAPORAN PEMINJAMAN SARANA & PRASARANA', 20, 20);
      
      // Add month/year
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Periode: ${format(currentDate, "MMMM yyyy", { locale: id }).toUpperCase()}`, 20, 30);
      
      // Add summary stats with better formatting
      const totalPeminjaman = data.length;
      const selesai = data.filter(d => d.status_peminjaman === "SELESAI").length;
      const dalamProses = data.filter(d => d.status_peminjaman === "DALAM_PROSES").length;
      const ditolak = data.filter(d => d.status_pengajuan === "PENGAJUAN_DITOLAK").length;
      
      doc.setFontSize(10);
      doc.text(`Total Peminjaman: ${totalPeminjaman}  |  Selesai: ${selesai}  |  Dalam Proses: ${dalamProses}  |  Ditolak: ${ditolak}`, 20, 40);
      
      // Table configuration
      const startY = 50;
      const rowHeight = 8;
      const colWidths = [12, 50, 55, 48, 45, 25, 22];
      const headers = ['No', 'Nama Acara & Waktu', 'Peminjam', 'Sarana', 'Prasarana', 'Status', 'Tgl Ajuan'];
      
      let currentY = drawHeader(startY);
      
      // Draw data rows
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      
      data.forEach((item, index) => {
        // Check if we need a new page
        if (currentY > 185) {
          doc.addPage();
          currentY = drawHeader(20);
        }
        
        // Format nama acara dengan waktu
        let namaAcaraText = item.nama_acara;
        if (item.tanggal_acara_dimulai && item.tanggal_acara_berakhir) {
          const tglMulai = format(new Date(item.tanggal_acara_dimulai), "dd/MM/yy");
          const tglBerakhir = format(new Date(item.tanggal_acara_berakhir), "dd/MM/yy");
          const waktuMulai = format(new Date(item.tanggal_acara_dimulai), "HH:mm");
          const waktuBerakhir = format(new Date(item.tanggal_acara_berakhir), "HH:mm");
          namaAcaraText += `\n${tglMulai} - ${tglBerakhir}`;
          namaAcaraText += `\n${waktuMulai} - ${waktuBerakhir}`;
        }
        
        // Format informasi peminjam
        const peminjamInfo = formatPeminjamInfo(item);
        let peminjamText = peminjamInfo.nama;
        if (peminjamInfo.detail !== '-') {
          peminjamText += `\n${peminjamInfo.detail}`;
        }
        if (peminjamInfo.type === 'mahasiswa' && peminjamInfo.jurusan !== '-') {
          peminjamText += `\n${truncateText(peminjamInfo.jurusan, 20)}`;
        } else if (peminjamInfo.type === 'pegawai' && peminjamInfo.jurusan !== '-') {
          peminjamText += `\n${truncateText(peminjamInfo.jurusan, 20)}`;
        }

        // Format sarana
        const saranaText = item.peminjamanSarana.length > 0 ? 
          item.peminjamanSarana.map(ps => `• ${ps.sarana.nama} (${ps.jumlah})`).join('\n') :
          '-';

        // Format prasarana
        const prasaranaText = item.peminjamanPrasarana.length > 0 ? 
          item.peminjamanPrasarana.map(pp => `• ${pp.prasarana.nama}`).join('\n') :
          '-';

        // Prepare row data
        const rowData = [
          (index + 1).toString(),
          namaAcaraText,
          peminjamText,
          saranaText,
          prasaranaText,
          getStatusText(item.status_peminjaman, item.status_pengajuan),
          format(new Date(item.tanggal_pengajuan), "dd/MM/yy")
        ];
        
        // Calculate max lines needed
        const maxLines = Math.max(...rowData.map(text => text.split('\n').length));
        const requiredRowHeight = Math.max(rowHeight, maxLines * 4 + 2);
        
        // Check if we need a new page with the required height
        if (currentY + requiredRowHeight > 185) {
          doc.addPage();
          currentY = drawHeader(20);
        }
        
        // Draw row background for alternate colors
        if (index % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(20, currentY, colWidths.reduce((a, b) => a + b, 0), requiredRowHeight, 'F');
        }
        
        // Draw cell borders dan content
        let currentX = 20;
        rowData.forEach((cellText, colIndex) => {
          // Draw cell border (hitam)
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.3);
          doc.rect(currentX, currentY, colWidths[colIndex], requiredRowHeight, 'S');
          
          // Draw cell content
          const lines = cellText.split('\n');
          lines.forEach((line, lineIndex) => {
            if (line.trim()) {
              const textY = currentY + 4 + (lineIndex * 4);
              
              // Set font size berbeda untuk sarana dan prasarana
              if (colIndex === 3 || colIndex === 4) { // Kolom sarana dan prasarana
                doc.setFontSize(7); // Font lebih kecil untuk sarana/prasarana
              } else {
                doc.setFontSize(8); // Font normal untuk kolom lain
              }
              
              // Truncate long text to fit column width
              const maxChars = Math.floor(colWidths[colIndex] / 2.5);
              const truncatedLine = truncateText(line, maxChars);
              doc.text(truncatedLine, currentX + 1, textY);
            }
          });
          
          currentX += colWidths[colIndex];
        });
        
        currentY += requiredRowHeight;
      });
      
      // Add footer pada setiap halaman
      const pageCount = doc.internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setDrawColor(0, 0, 0);
        doc.line(20, doc.internal.pageSize.height - 20, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 20);
        
        doc.setFontSize(8);
        doc.setTextColor(80, 80, 80);
        doc.text(`Digenerate pada: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: id })}`, 20, doc.internal.pageSize.height - 12);
        doc.text(`Halaman ${i} dari ${pageCount}`, 
          doc.internal.pageSize.width - 40, 
          doc.internal.pageSize.height - 12
        );
      }
      
      // Save the PDF
      const fileName = `laporan-peminjaman-${format(currentDate, "yyyy-MM")}.pdf`;
      doc.save(fileName);
      
      toast.success("Laporan PDF berhasil didownload");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Gagal menggenerate PDF");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <FileText className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Laporan Peminjaman
              </h1>
              <p className="text-sm sm:text-base text-gray-600">Laporan peminjaman sarana & prasarana bulanan</p>
            </div>
          </div>
          
          <Button
            onClick={downloadPDF}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg w-full sm:w-auto"
            disabled={data.length === 0 || isLoading}
          >
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Download PDF ({data.length} data)</span>
            <span className="sm:hidden">PDF ({data.length})</span>
          </Button>
        </div>

        {/* Month Navigator */}
        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Calendar className="h-5 w-5" />
                Periode Laporan
              </CardTitle>
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevMonth}
                  disabled={isLoading}
                  className="px-2 sm:px-3"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Prev</span>
                </Button>
                <span className="text-base sm:text-lg font-semibold min-w-[120px] sm:min-w-[150px] text-center px-2">
                  {format(currentDate, "MMM yyyy", { locale: id })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextMonth}
                  disabled={isLoading}
                  className="px-2 sm:px-3"
                >
                  <span className="hidden sm:inline mr-1">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{data.length}</div>
              <div className="text-xs sm:text-sm text-gray-600">Total Peminjaman</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {data.filter(d => d.status_peminjaman === "SELESAI").length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Selesai</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-orange-600">
                {data.filter(d => d.status_peminjaman === "DALAM_PROSES").length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Dalam Proses</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-red-600">
                {data.filter(d => d.status_pengajuan === "PENGAJUAN_DITOLAK").length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Ditolak</div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <CardTitle className="text-lg sm:text-xl">Data Peminjaman</CardTitle>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600 hidden sm:inline">Tampilkan:</span>
                <span className="text-gray-600 sm:hidden">Show:</span>
                <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                  <SelectTrigger className="w-16 sm:w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-gray-600 hidden sm:inline">per halaman</span>
                <span className="text-gray-600 sm:hidden">items</span>
              </div>
            </div>
            {totalItems > 0 && (
              <div className="text-sm text-gray-600">
                Menampilkan {startIndex + 1}-{Math.min(endIndex, totalItems)} dari {totalItems} data
              </div>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">No</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Nama Acara & Waktu</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Peminjam</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Sarana</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Prasarana</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Tgl Pengajuan</th>
                    </tr>
                  </thead>
                  <tbody>
                      {currentData.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                          Tidak ada data peminjaman untuk periode ini
                        </td>
                      </tr>
                    ) : (
                        currentData.map((item, index) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2">{startIndex + index + 1}</td>
                          <td className="border border-gray-300 px-4 py-2">
                              <div className="font-medium text-sm">{item.nama_acara}</div>
                              {item.tanggal_acara_dimulai && item.tanggal_acara_berakhir && (
                                <div className="text-xs text-gray-500 mt-1">
                                  📅 {format(new Date(item.tanggal_acara_dimulai), "dd/MM/yyyy")} - {format(new Date(item.tanggal_acara_berakhir), "dd/MM/yyyy")}
                                </div>
                              )}
                            {item.tanggal_acara_dimulai && item.tanggal_acara_berakhir && (
                                <div className="text-xs text-blue-600 mt-1">
                                  🕒 {format(new Date(item.tanggal_acara_dimulai), "HH:mm")} - {format(new Date(item.tanggal_acara_berakhir), "HH:mm")}
                              </div>
                            )}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                              {(() => {
                                const peminjamInfo = formatPeminjamInfo(item);
                                return (
                                  <div>
                                    <div className="font-medium text-sm">{peminjamInfo.nama}</div>
                                    {peminjamInfo.detail !== '-' && (
                                      <div className="text-xs text-gray-600">{peminjamInfo.detail}</div>
                                    )}
                                    {peminjamInfo.type === 'mahasiswa' && (
                                      <div className="text-xs text-gray-500">
                                        {peminjamInfo.jurusan} - {peminjamInfo.prodi}
                            </div>
                                    )}
                                    {peminjamInfo.type === 'pegawai' && peminjamInfo.jurusan !== '-' && (
                                      <div className="text-xs text-gray-500">Unit: {peminjamInfo.jurusan}</div>
                                    )}
                            {item.jumlah_peserta && (
                                      <div className="text-xs text-blue-600 font-medium">{item.jumlah_peserta} peserta</div>
                            )}
                                  </div>
                                );
                              })()}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {item.peminjamanSarana.length > 0 ? (
                              <div className="space-y-1">
                                {item.peminjamanSarana.map((ps, idx) => (
                                    <div key={idx} className="text-xs">
                                      • {ps.sarana.nama} ({ps.jumlah} {ps.sarana.satuan.singkatan})
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {item.peminjamanPrasarana.length > 0 ? (
                              <div className="space-y-1">
                                {item.peminjamanPrasarana.map((pp, idx) => (
                                    <div key={idx} className="text-xs">
                                      • {pp.prasarana.nama}
                                    {pp.prasarana.lokasi && (
                                        <div className="text-xs text-gray-500 ml-2">({pp.prasarana.lokasi})</div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {getStatusBadge(item.status_peminjaman, item.status_pengajuan)}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {format(new Date(item.tanggal_pengajuan), "dd/MM/yyyy")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden">
                  {currentData.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-500 text-sm">
                        Tidak ada data peminjaman untuk periode ini
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {currentData.map((item, index) => {
                        const peminjamInfo = formatPeminjamInfo(item);
                        return (
                          <Card key={item.id} className="p-4 shadow-sm border-l-4 border-l-blue-500">
                            <div className="space-y-3">
                              {/* Header with number and status */}
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                                    #{startIndex + index + 1}
                                  </span>
                                  {getStatusBadge(item.status_peminjaman, item.status_pengajuan)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {format(new Date(item.tanggal_pengajuan), "dd/MM/yyyy")}
                                </div>
                              </div>

                              {/* Event Name and Time */}
                              <div>
                                <h3 className="font-semibold text-sm text-gray-900 mb-1">
                                  {item.nama_acara}
                                </h3>
                                {item.tanggal_acara_dimulai && item.tanggal_acara_berakhir && (
                                  <div className="space-y-1">
                                    <div className="text-xs text-gray-600 flex items-center gap-1">
                                      📅 {format(new Date(item.tanggal_acara_dimulai), "dd/MM/yyyy")} - {format(new Date(item.tanggal_acara_berakhir), "dd/MM/yyyy")}
                                    </div>
                                    <div className="text-xs text-blue-600 flex items-center gap-1">
                                      🕒 {format(new Date(item.tanggal_acara_dimulai), "HH:mm")} - {format(new Date(item.tanggal_acara_berakhir), "HH:mm")}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Borrower Info */}
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">Peminjam</div>
                                <div className="font-medium text-sm">{peminjamInfo.nama}</div>
                                {peminjamInfo.detail !== '-' && (
                                  <div className="text-xs text-gray-600 mt-1">{peminjamInfo.detail}</div>
                                )}
                                {peminjamInfo.type === 'mahasiswa' && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {peminjamInfo.jurusan} - {peminjamInfo.prodi}
                                  </div>
                                )}
                                {peminjamInfo.type === 'pegawai' && peminjamInfo.jurusan !== '-' && (
                                  <div className="text-xs text-gray-500 mt-1">Unit: {peminjamInfo.jurusan}</div>
                                )}
                                {item.jumlah_peserta && (
                                  <div className="text-xs text-blue-600 font-medium mt-1">{item.jumlah_peserta} peserta</div>
                                )}
                              </div>

                              {/* Items */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Sarana */}
                                <div>
                                  <div className="text-xs text-gray-500 mb-2">Sarana</div>
                                  {item.peminjamanSarana.length > 0 ? (
                                    <div className="space-y-1">
                                      {item.peminjamanSarana.map((ps, idx) => (
                                        <div key={idx} className="text-xs bg-green-50 text-green-800 px-2 py-1 rounded">
                                          • {ps.sarana.nama} ({ps.jumlah} {ps.sarana.satuan.singkatan})
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-gray-400">Tidak ada sarana</span>
                                  )}
                                </div>

                                {/* Prasarana */}
                                <div>
                                  <div className="text-xs text-gray-500 mb-2">Prasarana</div>
                                  {item.peminjamanPrasarana.length > 0 ? (
                                    <div className="space-y-1">
                                      {item.peminjamanPrasarana.map((pp, idx) => (
                                        <div key={idx} className="text-xs bg-purple-50 text-purple-800 px-2 py-1 rounded">
                                          • {pp.prasarana.nama}
                                          {pp.prasarana.lokasi && (
                                            <div className="text-xs text-purple-600 ml-2">({pp.prasarana.lokasi})</div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-gray-400">Tidak ada prasarana</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && !isLoading && (
              <div className="mt-6 flex flex-col items-center gap-4">
                <div className="text-sm text-gray-600 order-2 sm:order-1">
                  Halaman {currentPage} dari {totalPages}
                </div>
                <div className="order-1 sm:order-2">
                  <Pagination>
                    <PaginationContent className="flex-wrap">
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                          className={`${currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} text-xs sm:text-sm px-2 sm:px-3`}
                        />
                      </PaginationItem>
                      
                      {/* Page numbers - mobile friendly */}
                      <div className="flex items-center">
                        {/* Mobile: Show only current-1, current, current+1 */}
                        <div className="flex sm:hidden">
                          {[Math.max(1, currentPage - 1), currentPage, Math.min(totalPages, currentPage + 1)]
                            .filter((pageNum, index, arr) => arr.indexOf(pageNum) === index)
                            .map((pageNum) => (
                              <PaginationItem key={pageNum}>
                                <PaginationLink
                                  onClick={() => handlePageChange(pageNum)}
                                  isActive={currentPage === pageNum}
                                  className="cursor-pointer text-xs min-w-8"
                                >
                                  {pageNum}
                                </PaginationLink>
                              </PaginationItem>
                            ))}
                        </div>
                        
                        {/* Desktop: Show more pages */}
                        <div className="hidden sm:flex">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                              <PaginationItem key={pageNum}>
                                <PaginationLink
                                  onClick={() => handlePageChange(pageNum)}
                                  isActive={currentPage === pageNum}
                                  className="cursor-pointer text-sm min-w-10"
                                >
                                  {pageNum}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          })}
                        </div>
                      </div>
                      
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <>
                          <PaginationItem>
                            <PaginationEllipsis className="text-xs sm:text-sm" />
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => handlePageChange(totalPages)}
                              className="cursor-pointer text-xs sm:text-sm min-w-8 sm:min-w-10"
                            >
                              {totalPages}
                            </PaginationLink>
                          </PaginationItem>
                        </>
                      )}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                          className={`${currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} text-xs sm:text-sm px-2 sm:px-3`}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

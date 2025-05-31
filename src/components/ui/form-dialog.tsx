import React from 'react';

const FormDialog = () => {
  return (
    <div className="p-6 space-y-10 bg-white text-black rounded-lg shadow-lg max-w-4xl mx-auto">
      {/* Mahasiswa Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Mahasiswa</h2>
        <div className="space-y-4">
          <input className="w-full border p-2 rounded" placeholder="Nama Mahasiswa" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="w-full border p-2 rounded" placeholder="NIM" />
            <input className="w-full border p-2 rounded" placeholder="UKM" />
            <input className="w-full border p-2 rounded" placeholder="Email" />
            <input className="w-full border p-2 rounded" placeholder="No. Whatsapp / No. Telp." />
          </div>
        </div>
      </section>

      {/* Kegiatan / Acara Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Kegiatan/Acara</h2>
        <div className="space-y-4">
          <input className="w-full border p-2 rounded" placeholder="Nama Kegiatan / Acara" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="date" className="w-full border p-2 rounded" placeholder="Tanggal Mulai Acara" />
            <input type="date" className="w-full border p-2 rounded" placeholder="Tanggal Pengembalian" />
          </div>
          <textarea className="w-full border p-2 rounded" placeholder="Deskripsi Acara" rows={3}></textarea>
          <div>
            <label className="block mb-1 font-medium">Lampiran surat pengajuan</label>
            <input
              type="file"
              accept=".png,.jpeg,.jpg"
              className="w-full border p-2 rounded file:mr-4 file:py-2 file:px-4 file:border file:rounded file:bg-gray-100 file:text-sm"
            />
          </div>
        </div>
      </section>

      {/* Peminjaman Ruang Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Peminjaman Ruang</h2>
        <div className="space-y-4">
          <input className="w-full border p-2 rounded" placeholder="Nama Ruangan Yang akan Dipinjam" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="date" className="w-full border p-2 rounded" placeholder="Tanggal Peminjaman" />
            <input type="date" className="w-full border p-2 rounded" placeholder="Tanggal Pengembalian" />
            <input className="w-full border p-2 rounded" placeholder="Email" />
            <input className="w-full border p-2 rounded" placeholder="No. Whatsapp / No. Telp." />
          </div>
          <input className="w-full border p-2 rounded" placeholder="Acara Yang akan dikehendaki" />
          <textarea className="w-full border p-2 rounded" placeholder="Deskripsi" rows={3}></textarea>
        </div>
      </section>
    </div>
  );
};

export default FormDialog;

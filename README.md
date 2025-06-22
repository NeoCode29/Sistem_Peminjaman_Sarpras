# Sarpras Management System

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (version 14.0 or higher)
- npm (Node Package Manager)
- PostgreSQL database

## Getting Started

Follow these steps to set up and run the project:

### 1. Installation

Install all project dependencies by running:

```bash
npm install
```

### 2. Environment Setup

Create your environment configuration file:

```bash
cp .env.example .env
```

Open the `.env` file and configure the following variables:
- `DATABASE_URL`: Your PostgreSQL database connection string
- [Add other important environment variables here]

### 3. Database Setup

Run database migrations to create the required tables:

```bash
npx prisma migrate dev
```

### 4. Seed Initial Data

Populate the database with initial seed data:

```bash
npm run seed
```

### 5. Start Development Server

Launch the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build the application for production
- `npm start` - Start production server
- `npm run seed` - Run database seeder

## Project Structure

```
sarpras/
├── prisma/          # Database schema and migrations
├── public/          # Static files
├── src/             # Source code
│   ├── app/        # Next.js app directory
│   ├── components/ # React components
│   └── lib/        # Utility functions
└── ...
```

## Contributing

[Add contribution guidelines here]

## License

[Add license information here]

## Fitur Sistem Peminjaman Sarana dan Prasarana

### 🔄 Fitur Pengembalian Barang

Sistem telah diperbaharui dengan logika pengembalian yang lebih fleksibel dan user-friendly:

#### ✅ Kondisi Pengembalian
- **Peminjam dapat melakukan checklist pengembalian** setelah melakukan pengambilan (`status_pengambilan = SUDAH_MENGAMBIL`)
- **Pengembalian diizinkan kapan saja** setelah pengambilan - **TIDAK** harus menunggu sampai acara selesai
- **Validasi otomatis** memastikan hanya item yang sudah diambil yang bisa dikembalikan

#### ⏰ Logika Waktu Pengembalian
1. **Syarat Utama**: Peminjam harus sudah mengambil barang terlebih dahulu
2. **Fleksibilitas Waktu**: Checklist pengembalian bisa dilakukan kapan saja setelah pengambilan
3. **Peringatan Sistem**: Jika pengembalian dilakukan jauh sebelum jadwal, sistem akan memberikan log peringatan (tapi tetap mengizinkan)

#### 📋 Checklist Pengembalian
- **Interface Interaktif**: Dialog checklist yang user-friendly
- **Validasi Real-time**: Tombol submit diaktifkan setelah pengambilan
- **Informasi Jelas**: Menampilkan status pengambilan dan pengembalian
- **Fleksibilitas**: Peminjam tidak perlu menunggu sampai acara selesai

#### 🔧 Implementasi Teknis
- Validasi di level service mengutamakan status pengambilan
- Validasi tanggal hanya memberikan peringatan, tidak memblokir
- Komponen UI menampilkan pesan yang sesuai dengan kondisi
- Error handling yang informatif

### Contoh Alur Pengembalian yang Diperbaharui:
1. Peminjam mengambil barang ✅
2. **Peminjam langsung bisa melakukan checklist pengembalian** 📋
3. Acara dilaksanakan 🎯
4. Peminjam mengembalikan barang (kapan saja) ✅
5. Admin memvalidasi pengembalian ✅

### 🆕 **Perubahan Penting:**
- **SEBELUM**: Checklist pengembalian hanya bisa dilakukan setelah tanggal acara berakhir
- **SEKARANG**: Checklist pengembalian bisa dilakukan kapan saja setelah pengambilan barang

**Jawaban untuk pertanyaan Anda**: Ya, dialog checklist pengembalian **tidak lagi terikat tanggal acara berakhir**. Peminjam dapat melakukan checklist pengembalian **segera setelah pengambilan** tanpa harus menunggu acara selesai. Ini memberikan fleksibilitas yang lebih baik untuk peminjam yang ingin mengembalikan barang lebih awal.
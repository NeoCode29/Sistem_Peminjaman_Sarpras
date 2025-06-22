const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const kategoriSarana = [
  {
    nama: "Elektronik",
  },
  {
    nama: "ATK",
  },
  {
    nama: "Furniture",
  },
  {
    nama: "Olahraga",
  },
]

const satuan = [
  {
    nama: "Unit",
    singkatan: "Unit",
  },
  {
    nama: "Lusin",
    singkatan: "Dzn",
  },
  {
    nama: "Kilogram",
    singkatan: "Kg",
  },
  {
    nama: "Meter",
    singkatan: "M",
  },
]

const jurusanData = [
  {
    nama: "TEKNIK SIPIL",
    prodi: [
      { nama: "D3 Teknik Sipil" },
      { nama: "Manajemen Konstruksi" },
      { nama: "Teknologi Rekayasa Konstruksi Jalan & Jembatan" },
      { nama: "Teknologi Rekayasa Konstruksi Bangunan Gedung" }
    ]
  },
  {
    nama: "TEKNIK MESIN",
    prodi: [
      { nama: "Teknik Manufaktur Kapal" },
      { nama: "Teknologi Rekayasa Otomotif" },
      { nama: "Teknologi Rekayasa Manufaktur" }
    ]
  },
  {
    nama: "BISNIS & INFORMATIKA",
    prodi: [
      { nama: "Bisnis Digital" },
      { nama: "Teknologi Rekayasa Komputer" },
      { nama: "Teknologi Rekayasa Perangkat Lunak" }
    ]
  },
  {
    nama: "PARIWISATA",
    prodi: [
      { nama: "Destinasi Pariwisata" },
      { nama: "Pengelolaan Perhotelan" },
      { nama: "Manajemen Bisnis Pariwisata" }
    ]
  },
  {
    nama: "PERTANIAN",
    prodi: [
      { nama: "Agribisnis" },
      { nama: "Teknologi Produksi Ternak" },
      { nama: "Teknologi Pengolahan Hasil Ternak" },
      { nama: "Teknologi Produksi Tanaman Pangan" },
      { nama: "Pengembangan Produk Agroindustri" },
      { nama: "Teknologi Budi Daya Perikanan" }
    ]
  }
]

const ormawaData = [
  { nama: "MPM" },
  { nama: "BEM" },
  { nama: "HMJ SIPIL" },
  { nama: "HMJ MESIN" },
  { nama: "HMJ TI" },
  { nama: "HMJ TANI" },
  { nama: "HMJ PARIWISATA" },
  { nama: "FORBIM" },
  { nama: "GENIWANGI" },
  { nama: "PERS" },
  { nama: "KWU" },
  { nama: "KSR" },
  { nama: "OLAHRAGA" },
  { nama: "MAPALA" },
  { nama: "RISET" },
  { nama: "RACANA" },
  { nama: "MENWA" },
  { nama: "IMAM" }
]

const pengaturanData = [
  {
    nama: "minimal_hari_pengajuan",
    nilai: "3",
  },
  {
    nama: "hari_hukuman",
    nilai: "7",
  },
  {
    nama: "url_file_form_peminjaman",
    nilai: "",
  },
  {
    nama: "url_form_peminjaman",
    nilai: "",
  },
  {
    nama: "nomer_handphone_admin",
    nilai: "",
  },
]

async function main() {
  console.log('Mulai seeding...')

  // Insert Kategori Sarana
  for (const item of kategoriSarana) {
    await prisma.kategoriSarana.upsert({
      where: {
        nama: item.nama,
      },
      update: {},
      create: item,
    })
  }
  console.log('Seeded: Kategori Sarana')

  // Insert Satuan
  for (const item of satuan) {
    await prisma.satuan.upsert({
      where: {
        nama: item.nama,
      },
      update: {},
      create: item,
    })
  }
  console.log('Seeded: Satuan')

  // Insert Jurusan and Prodi
  for (const jurusan of jurusanData) {
    const createdJurusan = await prisma.jurusan.upsert({
      where: {
        nama: jurusan.nama,
      },
      update: {},
      create: {
        nama: jurusan.nama,
      },
    })

    // Create Prodi for each Jurusan
    for (const prodi of jurusan.prodi) {
      await prisma.prodi.upsert({
        where: {
          nama: prodi.nama,
        },
        update: {},
        create: {
          nama: prodi.nama,
          jurusanId: createdJurusan.id,
        },
      })
    }
  }
  console.log('Seeded: Jurusan and Prodi')

  // Insert Ormawa
  for (const ormawa of ormawaData) {
    await prisma.ormawa.upsert({
      where: {
        nama: ormawa.nama,
      },
      update: {},
      create: ormawa,
    })
  }
  console.log('Seeded: Ormawa')

  // Insert Pengaturan
  for (const pengaturan of pengaturanData) {
    await prisma.pengaturan.upsert({
      where: {
        nama: pengaturan.nama,
      },
      update: {},
      create: pengaturan,
    })
  }
  console.log('Seeded: Pengaturan')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  }) 
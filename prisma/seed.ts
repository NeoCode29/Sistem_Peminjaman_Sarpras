import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Seed Kategori Sarana
  const kategoriSarana = [
    {
      nama: 'Elektronik',
      deskripsi: 'Peralatan elektronik seperti komputer, printer, dll.',
    },
    {
      nama: 'Furniture',
      deskripsi: 'Perabotan seperti meja, kursi, lemari, dll.',
    },
    {
      nama: 'Alat Kebersihan',
      deskripsi: 'Peralatan untuk kegiatan praktikum dan penelitian.',
    },
  ]

  // Seed Satuan
  const satuan = [
    {
      nama: 'Unit',
      singkatan: 'Unit',
      deskripsi: 'Satuan untuk menghitung per unit barang',
    },
    {
      nama: 'Pieces',
      singkatan: 'Pcs',
      deskripsi: 'Satuan untuk menghitung per pieces/buah',
    },
    {
      nama: 'Set',
      singkatan: 'Set',
      deskripsi: 'Satuan untuk menghitung per set barang',
    },
    {
      nama: 'Lusin',
      singkatan: 'Lsn',
      deskripsi: 'Satuan untuk menghitung per 12 buah',
    },
    {
      nama: 'Pack',
      singkatan: 'Pack',
      deskripsi: 'Satuan untuk menghitung per pack/bungkus',
    },
    {
      nama: 'Box',
      singkatan: 'Box',
      deskripsi: 'Satuan untuk menghitung per box/kotak',
    },
    {
      nama: 'Roll',
      singkatan: 'Roll',
      deskripsi: 'Satuan untuk menghitung per roll/gulungan',
    },
    {
      nama: 'Meter',
      singkatan: 'm',
      deskripsi: 'Satuan untuk mengukur panjang dalam meter',
    },
    {
      nama: 'Kilogram',
      singkatan: 'kg',
      deskripsi: 'Satuan untuk mengukur berat dalam kilogram',
    },
  ]

  console.log('Mulai seeding...')

  // Insert Kategori Sarana
  for (const kategori of kategoriSarana) {
    await prisma.kategoriSarana.upsert({
      where: { nama: kategori.nama },
      update: {},
      create: kategori,
    })
  }
  console.log('Seeded: Kategori Sarana')

  // Insert Satuan
  for (const item of satuan) {
    await prisma.satuan.upsert({
      where: { nama: item.nama },
      update: {},
      create: item,
    })
  }
  console.log('Seeded: Satuan')

  console.log('Seeding selesai.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 
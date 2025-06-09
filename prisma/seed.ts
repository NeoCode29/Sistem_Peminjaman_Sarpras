import { PrismaClient } from '@prisma/client'

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
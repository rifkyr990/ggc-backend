const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const fasilitasData = [
    { nama: 'Kolam Renang', iconUrl: 'https://example.com/icons/pool.png' },
    { nama: 'Taman', iconUrl: 'https://iili.io/FNlUJ07.png' },
    { nama: 'Playground', iconUrl: 'https://iili.io/FNlsJQs.png' },
    { nama: 'Keamanan 24 Jam', iconUrl: 'https://iili.io/FNlPi0l.png' },
    { nama: 'Area Parkir', iconUrl: 'https://iili.io/FNl4vrN.png' },
  ];

  for (const f of fasilitasData) {
    await prisma.fasilitas.create({ data: f });
  }

  console.log('Dummy fasilitas data inserted.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

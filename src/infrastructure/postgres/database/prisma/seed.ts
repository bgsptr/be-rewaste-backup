import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.role.createMany({
    data: [
      { id: "1", name: 'citizen' },
      { id: "2", name: 'verificator' },
      { id: "3", name: 'driver' },
      { id: "4", name: 'transporter' },
      { id: "5", name: 'village' },
      { id: "6", name: 'admin' },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(() => {
    console.log('Seeding selesai.');
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';
import { Hasher } from '../../../../utils/static/hasher';
import { roleNumber } from '../../../../utils/enum/role.enum';
import { generateIdForRole, RoleIdGenerate } from '../../../../utils/generator';

const prisma = new PrismaClient();

async function main() {
  // Create roles

  // turn off
  await prisma.role.createMany({
    data: [
      { id: '1', name: 'citizen' },
      { id: '2', name: 'verificator' },
      { id: '3', name: 'driver' },
      { id: '4', name: 'transporter' },
      { id: '5', name: 'village' },
      { id: '6', name: 'admin' },
    ],
    skipDuplicates: true,
  });

  // Create admin user

  // turn off kalo sudah pernah seed akun admin sebelumnya
  const { userId } = await prisma.user.create({
    data: {
      userId: generateIdForRole(RoleIdGenerate.admin),
      fullName: 'Admin Test',
      email: 'admin@example.com',
      phoneNumber: '081234567890',
      password: await Hasher.hashPassword('admin123'),
      nik: '1234567890123456',
      simNo: null,
      qrCode: null,
      addressId: null,
      rescheduleStatus: 'active',
      transporterId: null,
      villageId: null,
      wasteFees: null,
      loyaltyId: null,
      accountStatus: 'active',
      lastSeen: new Date(),
    },
  });

  await prisma.userRoles.create({
    data: {
      userId,
      roleId: roleNumber.ADMIN,
    },
  });

  // Create loyalty tiers
  const loyaltyTiers = await prisma.loyalty.createMany({
    data: [
      {
        loyaltyId: 'LOY-NOVICE',
        name: 'Eco Novice',
        minimumPoint: 0,
        maximumPoint: 99,
      },
      {
        loyaltyId: 'LOY-ENTHUSIAST',
        name: 'Eco Enthusiast',
        minimumPoint: 100,
        maximumPoint: 249,
      },
      {
        loyaltyId: 'LOY-WARRIOR',
        name: 'Eco Warrior',
        minimumPoint: 250,
        maximumPoint: 499,
      },
      {
        loyaltyId: 'LOY-CHAMPION',
        name: 'Recycling Champion',
        minimumPoint: 500,
        maximumPoint: 899,
      },
      {
        loyaltyId: 'LOY-HERO',
        name: 'Sustainability Hero',
        minimumPoint: 1000,
        maximumPoint: 1999,
      },
      {
        loyaltyId: 'LOY-GUARDIAN',
        name: 'Earth Guardian',
        minimumPoint: 2000,
        maximumPoint: 4999,
      },
      {
        loyaltyId: 'LOY-SAVIOR',
        name: 'Planet Savior',
        minimumPoint: 5000,
        maximumPoint: 99999999,
      },
    ],
    skipDuplicates: true,
  });

  const trashId = await prisma.trashType.createMany({
    data: [
      { id: '1', name: 'organik' },
      { id: '2', name: 'anorganik' },
      { id: '3', name: 'residu' },
    ],
    skipDuplicates: true,
  });

  // Create loyalty benefits
  const benefits = await prisma.loyaltyBenefit.createMany({
    data: [
      {
        benefitCode: 'BEN-WAR-001',
        name: 'Diskon 10% untuk layanan pickup',
        description: 'Diskon 10% untuk layanan pickup',
        tierId: 'LOY-WARRIOR',
      },
      {
        benefitCode: 'BEN-WAR-002',
        name: 'Voucher belanja Rp50.000',
        description: 'Dapatkan voucher belanja senilai Rp50.000',
        tierId: 'LOY-WARRIOR',
      },
      {
        benefitCode: 'BEN-WAR-003',
        name: 'Prioritas pickup',
        description: 'Permintaan pickup Anda akan diprioritaskan',
        tierId: 'LOY-WARRIOR',
      },
      {
        benefitCode: 'BEN-NOV-001',
        name: 'Edukasi Daur Ulang Dasar',
        description: 'Akses ke modul edukasi daur ulang untuk pemula',
        tierId: 'LOY-NOVICE',
      },
      {
        benefitCode: 'BEN-NOV-002',
        name: 'Stiker Digital Eco Novice',
        description: 'Dapatkan stiker digital untuk profil pengguna',
        tierId: 'LOY-NOVICE',
      },
      {
        benefitCode: 'BEN-NOV-003',
        name: 'Notifikasi Pickup Lebih Cepat',
        description: 'Mendapat notifikasi 1 hari sebelum jadwal pickup',
        tierId: 'LOY-NOVICE',
      },
    ],
    skipDuplicates: true,
  });

  console.log('Seeding completed successfully!');
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

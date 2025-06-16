import { PrismaClient } from '@prisma/client';
import { Hasher } from '../../../../utils/static/hasher';
import { roleNumber } from '../../../../utils/enum/role.enum';
import { generateIdForRole, RoleIdGenerate } from '../../../../utils/generator';

const prisma = new PrismaClient();

async function main() {
  // Create roles

  // turn off
  // await prisma.role.createMany({
  //   data: [
  //     { id: "1", name: 'citizen' },
  //     { id: "2", name: 'verificator' },
  //     { id: "3", name: 'driver' },
  //     { id: "4", name: 'transporter' },
  //     { id: "5", name: 'village' },
  //     { id: "6", name: 'admin' },
  //   ],
  //   skipDuplicates: true,
  // });

  // Create admin user

  // turn off kalo sudah pernah seed akun admin sebelumnya
  // const { userId } = await prisma.user.create({
  //   data: {
  //     userId: generateIdForRole(RoleIdGenerate.admin),
  //     fullName: "Admin Test",
  //     email: "admin@example.com",
  //     phoneNumber: "081234567890",
  //     password: await Hasher.hashPassword("admin123"),
  //     nik: "1234567890123456",
  //     simNo: null,
  //     qrCode: null,
  //     addressId: null,
  //     rescheduleStatus: "active",
  //     transporterId: null,
  //     villageId: null,
  //     wasteFees: null,
  //     loyaltyId: null,
  //     accountStatus: "active",
  //     lastSeen: new Date(),
  //   }
  // });

  // await prisma.userRoles.create({
  //   data: {
  //     userId,
  //     roleId: roleNumber.ADMIN
  //   }
  // });

  // Create loyalty tiers
  const loyaltyTiers = await prisma.loyalty.createMany({
    data: [
      {
        loyaltyId: 'LOY-BRONZE',
        name: 'Bronze',
        minimumPoint: 0,
        maximumPoint: '499'
      },
      {
        loyaltyId: 'LOY-SILVER',
        name: 'Silver',
        minimumPoint: 500,
        maximumPoint: '999'
      },
      {
        loyaltyId: 'LOY-GOLD',
        name: 'Gold',
        minimumPoint: 1000,
        maximumPoint: '1999'
      },
      {
        loyaltyId: 'LOY-PLATINUM',
        name: 'Platinum',
        minimumPoint: 2000,
        maximumPoint: 'NO_LIMIT'
      }
    ],
    skipDuplicates: true
  });

  // Create loyalty benefits
  const benefits = await prisma.loyaltyBenefit.createMany({
    data: [
      {
        benefitCode: 'BEN-001',
        name: '5% Discount on Waste Fees',
        description: 'Get 5% discount on monthly waste management fees'
      },
      {
        benefitCode: 'BEN-002',
        name: 'Priority Pickup',
        description: 'Your waste pickup requests get priority scheduling'
      },
      {
        benefitCode: 'BEN-003',
        name: 'Exclusive Vouchers',
        description: 'Access to exclusive partner vouchers and discounts'
      },
      {
        benefitCode: 'BEN-004',
        name: 'Double Points Days',
        description: 'Earn double points on selected days'
      },
      {
        benefitCode: 'BEN-005',
        name: 'Free Monthly Pickup',
        description: 'One free premium waste pickup per month'
      }
    ],
    skipDuplicates: true
  });

  const trashType = await prisma.trashType.createMany({
    data: [
      {
        id: '1',
        name: 'Organik'
      },
      {
        id: '2',
        name: 'Anorganik'
      },
      {
        id: '3',
        name: 'Residu'
      }
    ]
  })

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
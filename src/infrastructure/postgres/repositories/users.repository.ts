import { Injectable } from "@nestjs/common";
import { AccountStatus, PickupStatus, RescheduleStatus, User } from "@prisma/client";
import { CustomConflict } from "src/core/exceptions/custom-conflict.exception";
import { IUserRepository } from "src/core/interfaces/repositories/users.repository.interface";
import PrismaService from "src/core/services/prisma/prisma.service";
import { roleNumber } from "src/utils/enum/role.enum";
import { normalizeUserDefaults } from "src/utils/normalized/user.normalize";
import DayConvertion from "src/utils/static/dayjs";

@Injectable()
class UsersRepository implements IUserRepository {
    constructor(
        private prisma: PrismaService
    ) { }

    async getVerificatorDataById(verificatorId: string): Promise<User | null> {
        const user = await this.prisma.user.findFirst({
            where: {
                userId: verificatorId
            }
        });

        return user ?? null;
    }

    async checkAddressIsExist(userId: string): Promise<{ addressId: string | null } | null> {
        return await this.prisma.user.findFirst({
            where: {
                userId,
            },
            select: {
                addressId: true,
            },
        })
    }

    async updateAddNewAddress(addressId: string, userId: string) {
        return await this.prisma.user.update({
            data: {
                addressId
            },
            where: {
                userId
            }
        })
    }

    async getAccountCredentialWithEmail(email: string) {
        return await this.prisma.user.findFirstOrThrow({
            where: {
                email
            },
            select: {
                userId: true,
                email: true,
                phoneNumber: true,
                password: true,
                villageId: true,
                transporterId: true,
            }
        })
    }

    async registerAccount(data: Partial<User>, password?: string): Promise<string> {
        // const password = await Hasher.hashPassword("driver123");
        data = {
            ...data,
            password
        }
        const normalized = normalizeUserDefaults(data);

        try {
            const { userId } = await this.prisma.user.create({ data: normalized });
            return userId;
        } catch (err) {
            if (err.code === 'P2002') { // Unique constraint failed
                throw new CustomConflict('user', 'email');
            }

            throw err;
        }
    }


    async registerAccountFullData(data: User): Promise<string> {
        try {
            const { userId } = await this.prisma.user.create({ data });

            return userId;
        } catch (err) {
            if (err.code === 'P2002') { // Unique constraint failed
                throw new CustomConflict('user', 'email');
            }
            throw err;
        }
    }

    async addRoleToAccount(roleId: string, userId: string) {
        await this.prisma.userRoles.create({
            data: {
                roleId,
                userId,
            }
        })
    }

    async getCitizens(): Promise<User[]> {
        return await this.prisma.user.findMany();
    }

    async updateLastSeen(userId: string, date: Date): Promise<void> {
        await this.prisma.user.update({
            where: {
                userId,
            },
            data: {
                lastSeen: date
            }
        })
    }

    async getDriverByTransporter(id: string) {
        return await this.prisma.user.findMany({
            include: {
                car: {
                    select: {
                        id: true,
                    }
                },
                roles: true
            },
            where: {
                transporterId: id
            }
        })
    }

    async getAllCitizenHavingAddressAndNotRescheduled() {
        return await this.prisma.user.findMany({
            where: {
                roles: {
                    some: {
                        roleId: roleNumber.CITIZEN,
                    }
                },
                rescheduleStatus: RescheduleStatus.inactive,
            },
            select: {
                userId: true,
                villageId: true,
                address: {
                    select: {
                        addressId: true,
                    },
                },
            }
        });
    }

    async associateAllDriverToSelectedVillage(drivers: string[], driverVillageId: string): Promise<void> {
        await this.prisma.user.updateMany({
            data: {
                driverVillageId
            },
            where: {
                userId: {
                    in: drivers
                }
            }
        })
    }

    async getActiveCitizensWithTodayDraftTrash(villageId: string) {
        const { todayStart, todayEnd } = DayConvertion.getStartAndEndForToday();

        return await this.prisma.user.findMany({
            where: {
                accountStatus: AccountStatus.active,
                villageId: villageId,
                rescheduleStatus: RescheduleStatus.inactive,
                trashCitizen: {
                    some: {
                        pickupStatus: PickupStatus.draft || PickupStatus.cancelled,
                        createdAt: {
                            gte: todayStart,
                            lte: todayEnd,
                        },
                    },
                },
            },
            select: {
                userId: true,
                fullName: true,
                address: {
                    select: {
                        addressId: true,
                        fullAddress: true,
                        lat: true,
                        lng: true,
                    }
                },
                // trashCitizen: {
                //     where: {
                //         pickupStatus: PickupStatus.draft,
                //         createdAt: {
                //             gte: todayStart,
                //             lte: todayEnd,
                //         },
                //     },
                //     select: {
                //         id: true,
                //     }
                // }
            }
        });
    }

    async getSelfInformation(userId: string): Promise<User | null> {
        return await this.prisma.user.findFirst({
            where: {
                userId
            },
        })
    }

}

export default UsersRepository;
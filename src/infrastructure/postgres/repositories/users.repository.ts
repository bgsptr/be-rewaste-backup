import { Injectable } from "@nestjs/common";
import { RescheduleStatus, User } from "@prisma/client";
import { CustomConflict } from "src/core/exceptions/custom-conflict.exception";
import { IUserRepository } from "src/core/interfaces/repositories/users.repository.interface";
import PrismaService from "src/core/services/prisma/prisma.service";
import { roleNumber } from "src/utils/enum/role.enum";
import { normalizeUserDefaults } from "src/utils/normalized/user.normalize";
import { Hasher } from "src/utils/static/hasher";

@Injectable()
class UsersRepository implements IUserRepository {
    constructor(
        private prisma: PrismaService
    ) { }

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

    async getAllCitizenHavingAddressAndNotRescheduled(): Promise<any> {
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
}

export default UsersRepository;
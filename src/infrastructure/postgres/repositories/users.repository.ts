import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { IUserRepository } from "src/core/interfaces/repositories/users.repository.interface";
import PrismaService from "src/core/services/prisma/prisma.service";
import { normalizeUserDefaults } from "src/utils/normalized/user.normalize";

@Injectable()
class UsersRepository implements IUserRepository {
    constructor(
        private prisma: PrismaService
    ) {}

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

    async registerAccount(data: Partial<User>): Promise<string> {
        const normalized = normalizeUserDefaults(data);
        const { userId: returnedId } = await this.prisma.user.create({
            data: normalized
        });

        return returnedId;
    }

    async registerAccountFullData(data: User): Promise<string> {
        const { userId } = await this.prisma.user.create({ data });

        return userId;
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
}

export default UsersRepository;
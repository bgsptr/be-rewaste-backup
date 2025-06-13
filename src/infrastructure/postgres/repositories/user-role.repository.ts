import { Injectable } from "@nestjs/common";
import { UserRoles } from "@prisma/client";
import PrismaService from "src/core/services/prisma/prisma.service";

@Injectable()
class UserRoleRepository {
    constructor(
        private prisma: PrismaService
    ) {}

    async fetchAll(): Promise<UserRoles[]> {
        return await this.prisma.userRoles.findMany();
    }

    async addRole(userId: string, roleId: string) {
        await this.prisma.userRoles.create({
            data: {
                userId,
                roleId
            }
        })
    }

    async getRoles(userId: string) {
        return await this.prisma.userRoles.findMany({
            where: {
                userId,
            },
            select: {
                roleId: true,
            }
        });
    }
}

export default UserRoleRepository;
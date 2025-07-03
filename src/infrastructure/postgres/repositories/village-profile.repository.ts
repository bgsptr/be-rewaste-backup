import { Injectable } from "@nestjs/common";
import { VillageProfile } from "@prisma/client";
import { IVillageProfileRepository } from "src/core/interfaces/repositories/village-profile.repository.interface";
import PrismaService from "src/core/services/prisma/prisma.service";

@Injectable()
class VillageProfileRepository implements IVillageProfileRepository {
    constructor(
        private prisma: PrismaService
    ) {}

    async getById(villageId: string): Promise<VillageProfile | null> {
        return await this.prisma.villageProfile.findFirst({
            where: {
                villageId,
            },
        })
    }

    async create(data: VillageProfile) {
        return await this.prisma.villageProfile.create({
            data,
        });
    }

    async update(data: VillageProfile) {
        return await this.prisma.villageProfile.update({
            data,
            where: {
                villageId: data.villageId
            }
        })
    }
}

export default VillageProfileRepository;
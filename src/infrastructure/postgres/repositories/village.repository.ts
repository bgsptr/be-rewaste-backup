import { Village } from "@prisma/client";
import { IVillageRepository } from "src/core/interfaces/repositories/village.repository.interface";
import PrismaService from "src/core/services/prisma/prisma.service";

class VillageRepository implements IVillageRepository {
    constructor(
        private prisma: PrismaService
    ) {
        this.prisma = prisma;
    }

    async addVillage(data: Village): Promise<string> {
        const { id: villageId, villageName, province, district, regency, description, status } = data;
        const { id } =  await this.prisma.village.create({
            data: {
                id: villageId,
                villageName,
                province,
                district,
                regency,
                description,
                status,
            }
        })

        return id;
    }
}

export default VillageRepository;
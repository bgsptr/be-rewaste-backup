import { Injectable } from "@nestjs/common";
import { Village } from "@prisma/client";
import { IVillageRepository } from "src/core/interfaces/repositories/village.repository.interface";
import PrismaService from "src/core/services/prisma/prisma.service";

@Injectable()
class VillageRepository implements IVillageRepository {
    constructor(
        private readonly prisma: PrismaService
    ) {}

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

    async getAll() {
        return await this.prisma.village.findMany({
            include: {
                transporterVillage: {
                    include: {
                        transporter: {
                            select: {
                                name: true,
                                leaderFullname: true
                            }
                        }
                    }
                }
            }
        });
    }
}

export default VillageRepository;
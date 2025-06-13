import { Transporter } from "@prisma/client";
import ITransporterVillageRepository from "src/core/interfaces/repositories/transporter-village.repository.interface";
import ITransporterRepository from "src/core/interfaces/repositories/transporter.repository.interface";
import PrismaService from "src/core/services/prisma/prisma.service";

class TransporterVillageRepository implements ITransporterVillageRepository {
    constructor(
        private prisma: PrismaService, 
    ) {}

    async createData(transporterId: string, villageId: string): Promise<string> {
        const { transporterId: id } = await this.prisma.transporterVillage.create({
            data: {
                transporterId,
                villageId
            }
        })

        return id;
    }
}

export default TransporterVillageRepository;
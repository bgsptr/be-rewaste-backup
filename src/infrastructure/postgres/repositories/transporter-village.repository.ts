import { Injectable } from "@nestjs/common";
import { Transporter, TransporterVillage } from "@prisma/client";
import ITransporterVillageRepository from "src/core/interfaces/repositories/transporter-village.repository.interface";
import ITransporterRepository from "src/core/interfaces/repositories/transporter.repository.interface";
import PrismaService from "src/core/services/prisma/prisma.service";

@Injectable()
class TransporterVillageRepository implements ITransporterVillageRepository {
    constructor(
        private prisma: PrismaService, 
    ) {}

    async create(data: TransporterVillage): Promise<void> {
        await this.prisma.transporterVillage.create({
            data
        });
    }
}

export default TransporterVillageRepository;
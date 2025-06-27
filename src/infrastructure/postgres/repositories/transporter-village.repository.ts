import { Injectable } from "@nestjs/common";
import { JoinStatus, Transporter, TransporterVillage } from "@prisma/client";
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

    async countByTransporterOfVillage(villageId: string): Promise<number> {
        return await this.prisma.transporterVillage.count({
            where: {
                villageId,
            }
        })
    }

    async updateStatus(status: boolean, transporterId: string, villageId: string): Promise<void> {
        await this.prisma.transporterVillage.update({
            data: {
                joinStatus: status ? JoinStatus.Accepted : JoinStatus.Rejected,
                linkedAt: new Date(),
            },
            where: {
                transporterId_villageId: {
                    transporterId,
                    villageId,
                }
            }
        })
    }
}

export default TransporterVillageRepository;
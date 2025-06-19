import { Injectable } from "@nestjs/common";
import { Transporter } from "@prisma/client";
import ITransporterRepository from "src/core/interfaces/repositories/transporter.repository.interface";
import PrismaService from "src/core/services/prisma/prisma.service";

@Injectable()
class TransporterRepository implements ITransporterRepository {
    constructor(
        private prisma: PrismaService, 
    ) {}

    async create(data: Transporter): Promise<string> {
        const { id } = await this.prisma.transporter.create({
            data
        })

        return id;
    }

    async getAllDriversOnlyId(transporterId: string) {
        const { users } = await this.prisma.transporter.findFirstOrThrow({
            where: {
                id: transporterId,
            },
            select: {
                users: {
                    select: {
                        userId: true,
                        driverVillageId: true
                    },
                }
            }
        });

        return users.map(user => ({
            id: user.userId,
            villageId: user.driverVillageId,
        }));
    }
}

export default TransporterRepository;
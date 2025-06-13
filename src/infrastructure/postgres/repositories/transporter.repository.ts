import { Transporter } from "@prisma/client";
import ITransporterRepository from "src/core/interfaces/repositories/transporter.repository.interface";
import PrismaService from "src/core/services/prisma/prisma.service";

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
}

export default TransporterRepository;
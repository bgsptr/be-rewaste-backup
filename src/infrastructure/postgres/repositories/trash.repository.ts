import { Trash } from "@prisma/client";
import PrismaService from "src/core/services/prisma/prisma.service";

class TrashRepository {
    constructor(
        private prisma: PrismaService,
    ) {}

    async createTrash(data: Trash): Promise<void> {
        await this.prisma.trash.createMany({
            data,
        })
    }

    async updateTrash() {

    }
}

export default TrashRepository;
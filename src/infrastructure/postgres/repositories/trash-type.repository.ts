import { Injectable } from "@nestjs/common";
import PrismaService from "src/core/services/prisma/prisma.service";

@Injectable()
class TrashTypeRepository {
    constructor(
        private prisma: PrismaService,
    ) { }

    async getAllTrashTypeIds() {
        return await this.prisma.trashType.findMany({
            select: {
                id: true
            }
        });
    }
}

export default TrashTypeRepository
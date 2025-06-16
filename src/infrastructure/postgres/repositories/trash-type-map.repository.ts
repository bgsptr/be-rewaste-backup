import { Injectable } from "@nestjs/common";
import { TrashHasTrashType } from "@prisma/client";
import PrismaService from "src/core/services/prisma/prisma.service";

@Injectable()
class TrashTypeMapRepository {
    constructor(
        private prisma: PrismaService
    ) {}

    async generateTrashMapAllTypeCron(data: TrashHasTrashType[]) {
        await this.prisma.trashHasTrashType.createMany({
            data,
        })
    }
}

export default TrashTypeMapRepository;
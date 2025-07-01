import { Injectable } from "@nestjs/common";
import { TrashHasTrashType } from "@prisma/client";
import { ITrashPartRepository } from "src/core/interfaces/repositories/trash-has-trash-type.repository.interface";
import PrismaService from "src/core/services/prisma/prisma.service";

@Injectable()
class TrashPartRepository implements ITrashPartRepository {
    constructor(
        private prisma: PrismaService,
    ) {}

    async addOnePacket(data: TrashHasTrashType[]): Promise<void> {
        await this.prisma.trashHasTrashType.createMany({
            data
        });
    }
}

export default TrashPartRepository;
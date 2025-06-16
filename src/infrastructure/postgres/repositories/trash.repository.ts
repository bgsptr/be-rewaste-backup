import { Injectable } from "@nestjs/common";
import { Trash } from "@prisma/client";
import PrismaService from "src/core/services/prisma/prisma.service";

@Injectable()
class TrashRepository {
    constructor(
        private prisma: PrismaService,
    ) { }

    async createTrash(data: Trash[]): Promise<void> {
        await this.prisma.trash.createMany({
            data,
        })
    }

    async getTrashOwner(trashId: string): Promise<string> {
        const { userCitizenId } =  await this.prisma.trash.findFirstOrThrow({
            where: {
                id: trashId
            },
            select: {
                userCitizenId: true,
            }
        })

        return userCitizenId;
    }

    async getWithTypesById(trashId: string) {
        return await this.prisma.trash.findFirstOrThrow({
            where: {
                id: trashId,
            },
            select: {
                id: true,
                pickupStatus: true,
                createdAt: true,
                pickupAt: true,
                userDriver: {
                    select: {
                        userId: true,
                        fullName: true,
                    }
                },
                verification: {
                    select: {
                        createdAt: true,
                        verificatorUserId: true,
                    }
                },
                point: true,
                trashTypes: {
                    select: {
                        weight: true,
                        trashTypeId: true,
                        imageUrl: true,
                        trashType: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });
    }

    async getAllWithTypes(userId: string) {
        return await this.prisma.trash.findMany({
            where: {
                userCitizenId: userId
            },
            select: {
                id: true,
                pickupStatus: true,
                createdAt: true,
                point: true,
                trashTypes: {
                    select: {
                        weight: true,
                        trashTypeId: true,
                        trashType: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });
    }
}

export default TrashRepository;
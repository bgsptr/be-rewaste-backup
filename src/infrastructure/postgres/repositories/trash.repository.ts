import { Injectable } from "@nestjs/common";
import { PickupStatus, Trash } from "@prisma/client";
import PrismaService from "src/core/services/prisma/prisma.service";
import DayConvertion from "src/utils/static/dayjs";

@Injectable()
class TrashRepository {
    constructor(
        private prisma: PrismaService,
    ) { }

    async getAssignedLastForTodayWithDriverId(driverId: string) {
        const { todayStart: gte, todayEnd: lte } = DayConvertion.getStartAndEndForToday();

        return this.prisma.trash.findFirst({
            where: {
                userDriver: {
                    userId: driverId,
                },
                pickupStatus: PickupStatus.assigned,
                createdAt: {
                    gte,
                    lte,
                },
            },
            select: {
                userCitizen: {
                    select: {
                        address: true
                    }
                }
            },
            orderBy: {
                estimatePickupAt: 'desc', //boleh actualpickupat
            },
        });
    }


    async createTrash(data: Trash[]): Promise<void> {
        await this.prisma.trash.createMany({
            data,
        })
    }

    async getTrashOwner(trashId: string): Promise<string> {
        const { userCitizenId } = await this.prisma.trash.findFirstOrThrow({
            where: {
                id: trashId
            },
            select: {
                userCitizenId: true,
            }
        })

        return userCitizenId;
    }

    async getLatestTrashOfTheOwner(userId: string) {
        const { todayStart, todayEnd } = DayConvertion.getStartAndEndForToday();
        return await this.prisma.trash.findFirstOrThrow({
            where: {
                AND: {
                    userCitizenId: userId,
                    createdAt: {
                        gte: todayStart,
                        lte: todayEnd,
                    }
                }
            },
            select: {
                id: true,
                pickupStatus: true,
                createdAt: true,
                actualPickupAt: true,
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
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
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
                actualPickupAt: true,
                userCitizen: {
                    select: {
                        userId: true,
                        villageId: true,
                        address: true,
                    }
                },
                userDriver: {
                    select: {
                        userId: true,
                        fullName: true,
                        address: true,
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

    async updateTrashDetailById(trashId: string, distance: number, duration: number, estimatePickup: Date) {
        await this.prisma.trash.update({
            data: {
                pickupRange: distance,
                timeNeededInSecond: duration,
                estimatePickupAt: estimatePickup,
            },
            where: {
                id: trashId,
            }
        })
    }

    async updatePickupStatusById(trashId: string, selectedStatus: PickupStatus) {
        await this.prisma.trash.update({
            where: {
                pickupStatus: PickupStatus.generated,
                id: trashId,
            },
            data: {
                pickupStatus: selectedStatus
            }
        })
    }

    async getTrashByBatching(trashIds: string[]) {
        return await this.prisma.trash.findMany({
            where: {
                id: {
                    in: trashIds,
                },
            },
            select: {
                id: true,
                verifyStatus: true,
                userCitizen: {
                    select: {
                        userId: true,
                        address: true
                    }
                }
            }
        })
    }

    async getTrashTodayFromSelectedVillage(villageId: string) {
        const { todayStart: gte, todayEnd: lte } = DayConvertion.getStartAndEndForToday();
        return await this.prisma.trash.findMany({
            where: {
                // kalo mau tambahin created at
                // pickupStatus: PickupStatus.draft,
                createdAt: {
                    gte,
                    lte,
                },
                userCitizen: {
                    villageId,
                },
            },
            include: {
                userCitizen: {
                    select: {
                        loyaltyId: true,
                        // villageId: true,
                        address: true,
                    }
                },
                userDriver: {
                    select: {
                        transporterId: true,
                    }
                }
            }
        })
    }

    async bulkUpdateStatusAndDriver(
        mapping: { id: string, driverId: string }[],
    ) {
        const byDriver = new Map<string, string[]>();

        for (const { id, driverId } of mapping) {
            if (!byDriver.has(driverId)) {
                byDriver.set(driverId, []);
            }
            byDriver.get(driverId)!.push(id);
        }

        await Promise.all(
            Array.from(byDriver.entries()).map(([driverId, ids]) => {
                if (ids.length === 0) return Promise.resolve();
                return this.prisma.trash.updateMany({
                    where: {
                        id: { in: ids },
                    },
                    data: {
                        pickupStatus: PickupStatus.assigned,
                        userDriverId: driverId,
                    },
                });
            })
        );
    }


    // async getAllTrashAndCitizenWithStatusInProgress() {
    //     const { todayStart, todayEnd } = DayConvertion.getStartAndEndForToday();
    //     return await this.prisma.trash.findMany({
    //         where: {
    //             pickupStatus: PickupStatus.in_progress,
    //             createdAt: {
    //                 gte: todayStart,
    //                 lte: todayEnd,
    //             }
    //         },
    //         select: {
    //             userCitizen: {
    //                 select: {

    //                 }
    //             }
    //         }
    //     });
    // }

    async getTrashByBatchCitizenId(citizenIds: string[]) {
        const { todayStart: gte, todayEnd: lte } = DayConvertion.getStartAndEndForToday();
        return this.prisma.trash.findMany({
            where: {
                // verifyStatus: false,
                createdAt: {
                    gte,
                    lte,
                },
                userCitizen: {
                    // loyaltyId: {
                    //     not: null
                    // }, // nanti di table user
                    userId: {
                        in: citizenIds,
                    },
                },
            },
            select: {
                id: true,
                userCitizen: {
                    select: {
                        userId: true,
                        fullName: true,
                        email: true,
                        phoneNumber: true,
                        address: true,
                    }
                },
                verifyStatus: true,
                // pickupRange: true,
            }
        })
    }
}

export default TrashRepository;
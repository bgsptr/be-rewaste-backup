import { Injectable } from "@nestjs/common";
import { PickupStatus, RescheduleStatus, Village } from "@prisma/client";
import { IVillageRepository } from "src/core/interfaces/repositories/village.repository.interface";
import PrismaService from "src/core/services/prisma/prisma.service";
import DayConvertion from "src/utils/static/dayjs";

@Injectable()
class VillageRepository implements IVillageRepository {
    constructor(
        private readonly prisma: PrismaService
    ) { }

    async addVillage(data: Village): Promise<string> {
        const { id: villageId, villageName, province, district, regency, description, status } = data;
        const { id } = await this.prisma.village.create({
            data: {
                id: villageId,
                villageName,
                province,
                district,
                regency,
                description,
                status,
            }
        })

        return id;
    }

    async getAll() {
        return await this.prisma.village.findMany({
            include: {
                transporterVillage: {
                    include: {
                        transporter: {
                            select: {
                                name: true,
                                leaderFullname: true
                            }
                        }
                    }
                }
            }
        });
    }

    async getVillageWithFamilyCountAndDriver(transporterId: string) {
        return await this.prisma.village.findMany({
            where: {
                transporterVillage: {
                    some: {
                        transporterId,
                    }
                }
            },
            select: {
                id: true,
                villageName: true,
                regency: true,
                transporterVillage: {
                    where: {
                        transporterId,
                    },
                },
                _count: {
                    select: {
                        drivers: true,
                        users: true,
                    }
                },
            }
        })
    }

    // async getAllCitizensWithAddressInformation(villageId: string) {
    //     const { todayStart, todayEnd } = DayConvertion.getStartAndEndForToday();
    //     return await this.prisma.village.findUnique({
    //         where: {
    //             id: villageId,
    //         },
    //         select: {
    //             users: {
    //                 where: {
    //                     rescheduleStatus: RescheduleStatus.inactive
    //                 },
    //                 select: {
    //                     trashCitizen: {
    //                         where: {
    //                             AND: {
    //                                 pickupStatus: PickupStatus.draft,
    //                                 createdAt: {
    //                                     gte: todayStart,
    //                                     lte: todayEnd,
    //                                 },
    //                             }
    //                         },
    //                         select: {
    //                             id: true,
    //                             createdAt: true,
    //                         }
    //                     },
    //                     userId: true,
    //                     fullName: true,
    //                     address: {
    //                         select: {
    //                             addressId: true,
    //                             fullAddress: true,
    //                             lat: true,
    //                             lng: true,
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     })
    // }

    // async createVillageAccountTX() {
    //     return this.prisma.$transaction(async (tx) => {

    //     });
    // }
}

export default VillageRepository;
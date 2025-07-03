import { Injectable } from "@nestjs/common";
import { $Enums, Car, CarStatus } from "@prisma/client";
import { ICarRepository } from "src/core/interfaces/repositories/car.repository.interface";
import PrismaService from "src/core/services/prisma/prisma.service";

@Injectable()
class CarRepository implements ICarRepository {
    constructor(
        private prisma: PrismaService,
    ) { }

    async create(data: Car): Promise<string> {
        const { id } = await this.prisma.car.create({
            data
        })

        return id;
    }

    async getAllWithDriver() {
        return await this.prisma.car.findMany({
            include: {
                driver: {
                    select: {
                        village: true,
                        userId: true,
                        fullName: true
                    }
                },
            }
        })
    }

    async getFleetData(driverId: string) {
        return await this.prisma.car.findUnique({
            where: {
                driverId,
            },
            select: {
                id: true,
                platNo: true,
                merk: true,
                capacity: true,
                year: true,
                driver: {
                    select: {
                        userId: true,
                        fullName: true,
                    }
                },
                bbmHistory: {
                    select: {
                        id: true,
                        totalLiter: true,
                        kilometerAt: true,
                        price: true,
                        createdAt: true,
                    }
                }
            }
        });
    }

    // async getAllCarsWithIdleStatus(transporterId: string) {
    //     return await this.prisma.car.findMany({
    //         where: {
    //             transporterId,
    //             carStatus: CarStatus.idle,
    //         },
    //     })
    // }

    async get(id: string): Promise<Car> {
        return await this.prisma.car.findFirstOrThrow({
            where: {
                id,
            },
            include: {
                driver: {
                    select: {
                        userId: true,
                        fullName: true,
                        village: {
                            select: {
                                id: true,
                                villageName: true,
                            }
                        }
                    }
                }
            }
        })
    }

    async assignCarToDriver(carId: string, driverId: string) {
        return await this.prisma.car.update({
            data: {
                driverId,
                carStatus: CarStatus.operate,
            },
            where: {
                id: carId,
            }
        })
    }

    async getDriver(driverId: string) {
        return await this.prisma.car.findFirstOrThrow({
            where: {
                driverId,
            },
            select: {
                driver: true,
            }
        })
    }

    async findByPlatNo(platNo: string): Promise<Car | null> {
        return await this.prisma.car.findFirst({
            where: {
                platNo,
            }
        })
    }
}

export default CarRepository;
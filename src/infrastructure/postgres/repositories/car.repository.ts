import { Injectable } from "@nestjs/common";
import { $Enums, Car } from "@prisma/client";
import { ICarRepository } from "src/core/interfaces/repositories/car.repository.interface";
import PrismaService from "src/core/services/prisma/prisma.service";

@Injectable()
class CarRepository implements ICarRepository {
    constructor(
        private prisma: PrismaService,
    ) {}

    async create(data: Car): Promise<string> {
        const { id } = await this.prisma.car.create({
            data
        })

        return id;
    }

    async getAllWithDriver(): Promise<any> {
        return await this.prisma.car.findMany({
            include: {
                driver: {
                    select: {
                        userId: true,
                        fullName: true
                    }
                }
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
}

export default CarRepository;
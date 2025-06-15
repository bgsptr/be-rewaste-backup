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
}

export default CarRepository;
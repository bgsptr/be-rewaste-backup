import { Injectable } from "@nestjs/common";
import { Loyalty } from "@prisma/client";
import { IPointRepository } from "src/core/interfaces/repositories/point.repository.interface";
import PrismaService from "src/core/services/prisma/prisma.service";

@Injectable()
class PointRepository implements IPointRepository {
    constructor(
        private prisma: PrismaService,
    ) {}

    async create(data: { pointId: string; userId: string; lifetimePoint: number; remainPoint: number; }): Promise<void> {
        await this.prisma.point.create({
            data
        });
    }

    async getPointOverview(userId: string) {
        return await this.prisma.point.findUnique({
            where: {
                userId
            },
            include: {
                user: {
                    select: {
                        loyaltyId: true,
                    }
                },
            }
        })
    }
    
    // async getBenefitFromSelectedLoyaltyId(loyaltyId: string) {
    //     return await this.prisma.user.findMany();
    // }
}

export default PointRepository;
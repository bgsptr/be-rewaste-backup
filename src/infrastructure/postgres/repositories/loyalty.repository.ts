import { Injectable } from "@nestjs/common";
import { Loyalty } from "@prisma/client";
import { ILoyaltyRepository } from "src/core/interfaces/repositories/loyalty.repository.interface";
import PrismaService from "src/core/services/prisma/prisma.service";

@Injectable()
class LoyaltyRepository implements ILoyaltyRepository {
    constructor(
        private prisma: PrismaService,
    ) {}

    async getLoyaltyUserAndTheBenefits(loyaltyId: string) {
        return await this.prisma.loyalty.findMany({
            select: {
                benefits: {
                    where: {
                        tierId: loyaltyId,
                    },
                    select: {
                        benefitCode: true,
                        name: true,
                        description: true,
                    }
                }
            }
        })
    }

    async getAll(): Promise<Loyalty[]> {
        return await this.prisma.loyalty.findMany();
    }
}

export default LoyaltyRepository;
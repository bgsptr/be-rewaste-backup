import { Injectable } from "@nestjs/common";
import { IRatingRepository } from "src/core/interfaces/repositories/rating.repository.interface";
import PrismaService from "src/core/services/prisma/prisma.service";

@Injectable()
class RatingRepository implements IRatingRepository {
    constructor(
        private prisma: PrismaService
    ) {}

    async getAvgRatingByExistDriver(driverIds: string[]) {
        return await this.prisma.driverRating.groupBy({
            by: ['userDriverId'],
            where: {
                userDriverId: {
                    in: driverIds
                },
            },
            _avg: {
                ratingScore: true
            },
        })
    }
}

export default RatingRepository;
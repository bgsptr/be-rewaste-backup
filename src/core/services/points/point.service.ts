import { Injectable } from "@nestjs/common";
import { CustomForbidden } from "src/core/exceptions/custom-forbidden.exception";
import LoyaltyRepository from "src/infrastructure/postgres/repositories/loyalty.repository";
import PointRepository from "src/infrastructure/postgres/repositories/point.repository";

@Injectable()
class PointService {
    constructor(
        private pointRepository: PointRepository,
        private loyaltyRepository: LoyaltyRepository,
    ) {}

    async getOverview(userId: string) {
        const userData = await this.pointRepository.getPointOverview(userId);
        const loyalties = await this.loyaltyRepository.getAll();

        if (!userData?.user.loyaltyId) throw new CustomForbidden();
        const currentLoyalty = loyalties.findIndex(loyalty => loyalty.loyaltyId === userData.user.loyaltyId);
        const nextLoyalty = loyalties[currentLoyalty + 1];
        const selectedBenefit = await this.loyaltyRepository.getLoyaltyUserAndTheBenefits(userData.user.loyaltyId);
        
        const pointNeedToNextLoyalty = nextLoyalty.minimumPoint - userData.lifetimePoint;

        return {
            ...userData,
            benefits: selectedBenefit[0].benefits,
            pointNeed: pointNeedToNextLoyalty
        }
    }
}

export default PointService;
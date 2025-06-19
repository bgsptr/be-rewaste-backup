import { Loyalty } from "@prisma/client";
import { Repository } from "src/core/base/repository";

export interface ILoyaltyRepository extends Repository<Loyalty> {
    getLoyaltyUserAndTheBenefits(loyaltyId: string): Promise<any>;
    getAll(): Promise<Loyalty[]>;
}
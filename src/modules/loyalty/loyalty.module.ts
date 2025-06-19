import { Module } from "@nestjs/common";
import LoyaltyRepository from "src/infrastructure/postgres/repositories/loyalty.repository";

@Module({
    providers: [LoyaltyRepository],
    exports: [LoyaltyRepository],
})

export class LoyaltyModule {

}
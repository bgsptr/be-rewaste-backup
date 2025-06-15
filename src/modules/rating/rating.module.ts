import { Module } from "@nestjs/common";
import PrismaService from "src/core/services/prisma/prisma.service";
import RatingRepository from "src/infrastructure/postgres/repositories/rating.repository";

@Module({
    providers: [RatingRepository, PrismaService],
    exports: [RatingRepository],
})

export class RatingModule {}
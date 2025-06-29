import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import VerificationController from "./verification.controller";
import VerificationService from "src/core/services/verifications/verification.service";
import TrashRepository from "src/infrastructure/postgres/repositories/trash.repository";
import UsersRepository from "src/infrastructure/postgres/repositories/users.repository";
import VillageRepository from "src/infrastructure/postgres/repositories/village.repository";
import VerificationRepository from "src/infrastructure/postgres/repositories/verification.repository";
import { AuthMiddleware } from "src/middlewares/auth.middleware";

@Module({
    controllers: [VerificationController],
    providers: [VerificationService, TrashRepository, UsersRepository, VillageRepository, VerificationRepository],
})

export class VerificationModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes('verifications');
    }
}
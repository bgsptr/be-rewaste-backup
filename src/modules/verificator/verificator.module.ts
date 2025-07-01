import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import VerificatorController from "./verificator.controller";
import UserService from "src/core/services/users/user.service";
import { CitizenMapper } from "src/application/mapper/citizen.mapper";
import { VerificatorMapper } from "src/application/mapper/verificator.mapper";
import UsersRepository from "src/infrastructure/postgres/repositories/users.repository";
import UserRoleRepository from "src/infrastructure/postgres/repositories/user-role.repository";
import PointRepository from "src/infrastructure/postgres/repositories/point.repository";
import { AuthMiddleware } from "src/middlewares/auth.middleware";
import VerificationService from "src/core/services/verifications/verification.service";
import TrashRepository from "src/infrastructure/postgres/repositories/trash.repository";
import VillageRepository from "src/infrastructure/postgres/repositories/village.repository";
import VerificationRepository from "src/infrastructure/postgres/repositories/verification.repository";
import TrashPartRepository from "src/infrastructure/postgres/repositories/trash-part.repository";
import AddressRepository from "src/infrastructure/postgres/repositories/address.repository";

@Module({
    controllers: [VerificatorController],
    providers: [UserService, VerificationService, CitizenMapper, VerificatorMapper, UsersRepository, UserRoleRepository, PointRepository, TrashRepository, VillageRepository, VerificationRepository, TrashPartRepository, AddressRepository],
})

export class VerificatorModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes('verificators');
    }
}
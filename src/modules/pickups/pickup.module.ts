import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import PickupController from "./pickup.controller";
import UserService from "src/core/services/users/user.service";
import UsersRepository from "src/infrastructure/postgres/repositories/users.repository";
import { CitizenMapper } from "src/application/mapper/citizen.mapper";
import { VerificatorMapper } from "src/application/mapper/verificator.mapper";
import PointRepository from "src/infrastructure/postgres/repositories/point.repository";
import UserRoleRepository from "src/infrastructure/postgres/repositories/user-role.repository";
import { AuthMiddleware } from "src/middlewares/auth.middleware";
import VillageRepository from "src/infrastructure/postgres/repositories/village.repository";

@Module({
    controllers: [PickupController],
    providers: [UserService, UsersRepository, UserRoleRepository, CitizenMapper, VerificatorMapper, PointRepository, VillageRepository]
})

export class PickupModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes('pickups');
    }
}
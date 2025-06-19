import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import VerificatorController from "./verificator.controller";
import UserService from "src/core/services/users/user.service";
import { CitizenMapper } from "src/application/mapper/citizen.mapper";
import { VerificatorMapper } from "src/application/mapper/verificator.mapper";
import UsersRepository from "src/infrastructure/postgres/repositories/users.repository";
import UserRoleRepository from "src/infrastructure/postgres/repositories/user-role.repository";
import PointRepository from "src/infrastructure/postgres/repositories/point.repository";
import { AuthMiddleware } from "src/middlewares/auth.middleware";

@Module({
    controllers: [VerificatorController],
    providers: [UserService, CitizenMapper, VerificatorMapper, UsersRepository, UserRoleRepository, PointRepository],
})

export class VerificatorModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes('verificators');
    }
}
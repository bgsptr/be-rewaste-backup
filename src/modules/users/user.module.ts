import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import UserController from "./user.controller";
import UserService from "src/core/services/users/user.service";
import UsersRepository from "src/infrastructure/postgres/repositories/users.repository";
import { CitizenMapper } from "src/application/mapper/citizen.mapper";
import { AuthMiddleware } from "src/middlewares/auth.middleware";
import UserRoleRepository from "src/infrastructure/postgres/repositories/user-role.repository";
import PointRepository from "src/infrastructure/postgres/repositories/point.repository";
import { VerificatorMapper } from "src/application/mapper/verificator.mapper";

@Module({
    providers: [UserService, UsersRepository, CitizenMapper, VerificatorMapper, UserRoleRepository, PointRepository],
    controllers: [UserController],
    exports: [UsersRepository],
})

export class UserModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes('citizens');
    }
}
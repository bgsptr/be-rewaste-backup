import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import DriverService from "src/core/services/drivers/driver.service";
import { LoggerService } from "src/infrastructure/logger/logger.service";
import UserRoleRepository from "src/infrastructure/postgres/repositories/user-role.repository";
import UsersRepository from "src/infrastructure/postgres/repositories/users.repository";
import DriverController from "./driver.controller";
import CarService from "src/core/services/cars/car.service";
import CarRepository from "src/infrastructure/postgres/repositories/car.repository";
import RatingRepository from "src/infrastructure/postgres/repositories/rating.repository";
import { CarMapper } from "src/application/mapper/car.mapper";
import { AuthMiddleware } from "src/middlewares/auth.middleware";

@Module({
    controllers: [DriverController],
    providers: [DriverService, CarService, UsersRepository, UserRoleRepository, LoggerService, CarRepository, RatingRepository, CarMapper],
    exports: [DriverService],
})

export class DriverModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes('drivers');
    }
}
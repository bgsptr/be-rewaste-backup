import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import CarController from "./car.controller";
import CarService from "src/core/services/cars/car.service";
import { AuthMiddleware } from "src/middlewares/auth.middleware";
import CarRepository from "src/infrastructure/postgres/repositories/car.repository";
import { CarMapper } from "src/application/mapper/car.mapper";

@Module({
    providers: [CarService, CarRepository, CarMapper],
    controllers: [CarController],
    exports: [CarRepository, CarMapper],
})

export class CarModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes('cars');
    }
}
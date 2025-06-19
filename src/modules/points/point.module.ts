import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import PointRepository from "src/infrastructure/postgres/repositories/point.repository";
import PointController from "./point.controller";
import LoyaltyRepository from "src/infrastructure/postgres/repositories/loyalty.repository";
import PointService from "src/core/services/points/point.service";
import { AuthMiddleware } from "src/middlewares/auth.middleware";

@Module({
    controllers: [PointController],
    providers: [PointService, PointRepository, LoyaltyRepository],
    exports: [PointRepository],
})

export class PointModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes("points");
    }
}
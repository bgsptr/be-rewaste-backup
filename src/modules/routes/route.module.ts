import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import RouteController from "./route.controller";
import UsersRepository from "src/infrastructure/postgres/repositories/users.repository";
import RouteService from "src/core/services/routes/route.service";
import TrashRepository from "src/infrastructure/postgres/repositories/trash.repository";
import TransporterVillageRepository from "src/infrastructure/postgres/repositories/transporter-village.repository";
import { OpenRouteAPIService } from "src/core/services/openrouteservice/open-route-api.service";
import { AuthMiddleware } from "src/middlewares/auth.middleware";
import { HttpModule } from "@nestjs/axios";
import VillageRepository from "src/infrastructure/postgres/repositories/village.repository";

@Module({
    imports: [HttpModule],
    controllers: [RouteController],
    providers: [RouteService, UsersRepository, TrashRepository, TransporterVillageRepository, OpenRouteAPIService, VillageRepository]
})

export class RouteModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes('routes');
    }
}
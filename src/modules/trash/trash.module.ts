import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import TrashService from "src/core/services/trash/trash.service";
import TrashTypeMapRepository from "src/infrastructure/postgres/repositories/trash-type-map.repository";
import TrashTypeRepository from "src/infrastructure/postgres/repositories/trash-type.repository";
import TrashRepository from "src/infrastructure/postgres/repositories/trash.repository";
import UsersRepository from "src/infrastructure/postgres/repositories/users.repository";
import TrashController from "./trash.controller";
import { AuthMiddleware } from "src/middlewares/auth.middleware";
import VillageRepository from "src/infrastructure/postgres/repositories/village.repository";
import { HttpModule } from "@nestjs/axios";
import { OpenRouteAPIService } from "src/core/services/openrouteservice/open-route-api.service";

@Module({
    imports: [HttpModule],
    controllers: [TrashController],
    providers: [TrashService, TrashRepository, UsersRepository, TrashTypeRepository, TrashTypeMapRepository, VillageRepository, OpenRouteAPIService]
})

export class TrashModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes('trash');
    }
}
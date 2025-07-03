import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import VillageController from "./village.controller";
import VillageService from "src/core/services/villages/village.service";
import { LoggerModule } from "src/infrastructure/logger/logger.module";
import { VillageMapper } from "src/application/mapper/village.mapper";
import { UserRoleModule } from "../user-role/user-role.module";
import VillageRepository from "src/infrastructure/postgres/repositories/village.repository";
import UsersRepository from "src/infrastructure/postgres/repositories/users.repository";
import UserRoleRepository from "src/infrastructure/postgres/repositories/user-role.repository";
import TransporterVillageRepository from "src/infrastructure/postgres/repositories/transporter-village.repository";
import VillageProfileRepository from "src/infrastructure/postgres/repositories/village-profile.repository";
import VillageProfileMapper from "src/application/mapper/village-profile.mapper";
import { AuthMiddleware } from "src/middlewares/auth.middleware";

@Module({
    imports: [LoggerModule],
    providers: [VillageService, VillageRepository, UsersRepository, VillageMapper, UserRoleRepository, TransporterVillageRepository, VillageRepository, VillageProfileRepository, VillageProfileMapper],
    controllers: [VillageController],
})

export class VillageModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes('villages');
    }
}
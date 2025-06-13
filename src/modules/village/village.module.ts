import { Module } from "@nestjs/common";
import VillageController from "./village.controller";
import VillageService from "src/core/services/villages/village.service";
import { LoggerModule } from "src/infrastructure/logger/logger.module";
import { VillageMapper } from "src/application/mapper/village.mapper";
import { UserRoleModule } from "../user-role/user-role.module";
import VillageRepository from "src/infrastructure/postgres/repositories/village.repository";
import UsersRepository from "src/infrastructure/postgres/repositories/users.repository";
import UserRoleRepository from "src/infrastructure/postgres/repositories/user-role.repository";

@Module({
    imports: [LoggerModule],
    providers: [VillageService, VillageRepository, UsersRepository, VillageMapper, UserRoleRepository],
    controllers: [VillageController],
})

export class VillageModule { }
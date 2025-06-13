import { Module } from "@nestjs/common";
import DriverService from "src/core/services/drivers/driver.service";
import { LoggerService } from "src/infrastructure/logger/logger.service";
import UserRoleRepository from "src/infrastructure/postgres/repositories/user-role.repository";
import UsersRepository from "src/infrastructure/postgres/repositories/users.repository";

@Module({
    providers: [DriverService, UsersRepository, UserRoleRepository, LoggerService],
    exports: [DriverService],
})

export class DriverModule {}
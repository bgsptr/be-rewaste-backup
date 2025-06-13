import { Module } from "@nestjs/common";
import UserController from "./user.controller";
import UserService from "src/core/services/users/user.service";
import UsersRepository from "src/infrastructure/postgres/repositories/users.repository";

@Module({
    providers: [UserService, UsersRepository],
    controllers: [UserController],
    exports: [UsersRepository],
})

export class UserModule {}
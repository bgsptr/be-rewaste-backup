import { Module } from "@nestjs/common";
import UserRoleRepository from "src/infrastructure/postgres/repositories/user-role.repository";

@Module({
    providers: [UserRoleRepository],
    exports: [UserRoleRepository]
})

export class UserRoleModule {}
import { Module } from "@nestjs/common";
import TrashService from "src/core/services/trash/trash.service";
import TrashRepository from "src/infrastructure/postgres/repositories/trash.repository";
import UsersRepository from "src/infrastructure/postgres/repositories/users.repository";

@Module({
    providers: [TrashService, TrashRepository, UsersRepository]
})

export class TrashModule {}
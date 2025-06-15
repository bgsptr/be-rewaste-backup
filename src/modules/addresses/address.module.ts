import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import AddressService from "src/core/services/addresses/address.service";
import AddressRepository from "src/infrastructure/postgres/repositories/address.repository";
import UsersRepository from "src/infrastructure/postgres/repositories/users.repository";
import AddressController from "./address.controller";
import { AuthMiddleware } from "src/middlewares/auth.middleware";

@Module({
    controllers: [AddressController],
    providers: [AddressRepository, AddressService, UsersRepository],
    exports: [AddressRepository],
})

export class AddressModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes('address');
    }
}
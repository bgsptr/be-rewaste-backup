import { Module } from "@nestjs/common";
import AddressRepository from "src/infrastructure/postgres/repositories/address.repository";

@Module({
    providers: [AddressRepository],
    exports: [AddressRepository],
})

export class AddressModule {}
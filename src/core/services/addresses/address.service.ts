import { Injectable } from "@nestjs/common";
import { CreateAddressDto } from "src/application/dto/addresses/address.dto";
import { CustomConflict } from "src/core/exceptions/custom-conflict.exception";
import { LoggerService } from "src/infrastructure/logger/logger.service";
import AddressRepository from "src/infrastructure/postgres/repositories/address.repository";
import UsersRepository from "src/infrastructure/postgres/repositories/users.repository";
import { generateIdWithNano } from "src/utils/generator";

@Injectable()
class AddressService {
    constructor(
        private addressRepository: AddressRepository,
        private userRepository: UsersRepository,
        private logger: LoggerService,
    ) { }

    async createNewAddress(data: CreateAddressDto, userId: string) {
        try {
            this.logger.log("POST /address")
            const addressId = `ADDRESS-${generateIdWithNano()}`
            const result = await this.userRepository.checkAddressIsExist(userId);
            if (result?.addressId) throw new CustomConflict("address", "user-id");
            const addressReturningId = await this.addressRepository.create({ addressId, ...data });
            await this.userRepository.updateAddNewAddress(addressReturningId, userId);

            this.logger.log("successfully create new address");
        } catch (err) {
            this.logger.error(err);
            throw new CustomConflict("address", "user-id");
        }
    }
}

export default AddressService;
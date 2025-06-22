import { Injectable } from "@nestjs/common";
import { PrismaClientValidationError } from "@prisma/client/runtime/library";
import { CreateAddressDto } from "src/application/dto/addresses/address.dto";
import { CustomBadRequest } from "src/core/exceptions/custom-bad-request.exception";
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
            this.logger.debug(result);
            this.logger.debug(result && result.addressId !== null);
            if (result && result.addressId !== null) throw new CustomConflict("address", "user-id");

            this.logger.debug(data);
            const addressReturningId = await this.addressRepository.create({ addressId, ...data });

            this.logger.debug("pass address returning id");
            await this.userRepository.updateAddNewAddress(addressReturningId, userId);

            this.logger.log("successfully create new address");
        } catch (err) {
            this.logger.error(err);
            if (err instanceof PrismaClientValidationError) throw new CustomBadRequest(err.message); 
            throw new CustomConflict("address", `user with id ${userId}`);
        }
    }
}

export default AddressService;
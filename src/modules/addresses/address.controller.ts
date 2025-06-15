import { Body, Controller, Post } from "@nestjs/common";
import { CreateAddressDto } from "src/application/dto/addresses/address.dto";
import { CustomUnauthorized } from "src/core/exceptions/custom-unathorized.exception";
import AddressService from "src/core/services/addresses/address.service";
import { FetchJWTPayload } from "src/shared/decorators/fetch-jwt-payload.decorator";

@Controller("address")
class AddressController {
    constructor(
        private addressService: AddressService,
    ) {}

    @Post()
    async addSelectedUserAddress(@Body() data: CreateAddressDto, @FetchJWTPayload() payload: { id: string }) {
        if (!payload.id) throw new CustomUnauthorized();
        await this.addressService.createNewAddress(data, payload.id);

        return {
            success: true,
            message: `successfully add address for user with id ${payload.id}`,
        }
    }
}

export default AddressController;
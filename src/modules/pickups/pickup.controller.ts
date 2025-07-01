import { Controller, Get } from "@nestjs/common";
import AddressService from "src/core/services/addresses/address.service";
import UserService from "src/core/services/users/user.service";
import VillageService from "src/core/services/villages/village.service";
import { FetchJWTPayload } from "src/shared/decorators/fetch-jwt-payload.decorator";

@Controller("pickups")
class PickupController {
    constructor(
        private userService: UserService,
        private addressService: AddressService,
    ) {}

    // roles = [driver]
    @Get()
    async getCitizenTodayWithDraftStatusController(@FetchJWTPayload() payload: { id: string }) {
        await this.addressService.checkAddressIsExistService(payload.id);
        const data = await this.userService.getCitizenWithStatusDraft(payload.id);

        return {
            success: true,
            message: "fetch daily trash successfully",
            result: data,
        }
    }
}

export default PickupController;
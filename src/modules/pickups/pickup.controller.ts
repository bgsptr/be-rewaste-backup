import { Controller, Get } from "@nestjs/common";
import UserService from "src/core/services/users/user.service";
import { FetchJWTPayload } from "src/shared/decorators/fetch-jwt-payload.decorator";

@Controller("pickups")
class PickupController {
    constructor(
        private userService: UserService,
    ) {}

    // roles = [driver]
    @Get()
    async getCitizenTodayWithDraftStatusController(@FetchJWTPayload() payload: { id: string }) {

        const data = await this.userService.getCitizenWithStatusDraft(payload.id);

        return {
            success: true,
            message: "fetch daily trash successfully",
            result: data,
        }
    }
}

export default PickupController;
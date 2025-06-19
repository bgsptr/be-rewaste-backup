import { Body, Controller, Post } from "@nestjs/common";
import { CreateVerificatorDto } from "src/application/dto/verificators/create_verificator.dto";
import { CustomForbidden } from "src/core/exceptions/custom-forbidden.exception";
import UserService from "src/core/services/users/user.service";
import { LoggerService } from "src/infrastructure/logger/logger.service";
import { FetchJWTPayload } from "src/shared/decorators/fetch-jwt-payload.decorator";

@Controller("verificators")
class VerificatorController {
    constructor(
        private userService: UserService,
        private loggerService: LoggerService,
    ) {}

    @Post()
    async createNewVerificatorAccountController(@Body() data: CreateVerificatorDto, @FetchJWTPayload() payload: { id: string, roles: string[] }) {
        this.loggerService.log("POST /verificators");
        this.loggerService.debug(payload);
        if (!payload) throw new CustomForbidden();
        const verificatorId = await this.userService.addVerificator(data);

        return {
            status: true,
            message: `successfully add user with id ${verificatorId}`,
            data: {
                verificatorId
            }
        }
    }
}

export default VerificatorController;
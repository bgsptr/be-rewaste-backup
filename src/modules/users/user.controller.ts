import { Body, Controller, Post } from "@nestjs/common";
import { CreateCitizenDto } from "src/application/dto/citizens/create_citizen.dto";
import { CustomForbidden } from "src/core/exceptions/custom-forbidden.exception";
import UserService from "src/core/services/users/user.service";
import { LoggerService } from "src/infrastructure/logger/logger.service";
import { FetchJWTPayload } from "src/shared/decorators/fetch-jwt-payload.decorator";

@Controller("citizens")
class UserController {
    constructor(
        private userService: UserService,
        private loggerService: LoggerService,
    ) { }

    @Post()
    async createNewCitizenAccountController(@Body() citizenDto: CreateCitizenDto, @FetchJWTPayload() payload: { id: string, roles: string[] }) {
        this.loggerService.log("POST /citizens");
        this.loggerService.debug(payload);
        if (!payload) throw new CustomForbidden();
        const userId = await this.userService.addCitizen(citizenDto, payload.id);

        return {
            status: true,
            message: `successfully add user with id ${userId}`,
            data: {
                userId
            }
        }
    }
}

export default UserController;
import { Body, Controller, Post } from "@nestjs/common";
import { CreateCitizenDto } from "src/application/dto/citizens/create_citizen.dto";
import UserService from "src/core/services/users/user.service";
import { LoggerService } from "src/infrastructure/logger/logger.service";
import { GetVillageId } from "src/shared/decorators/get-village-id.decorator";

@Controller("citizens")
class UserController {
    constructor(
        private userService: UserService,
        private loggerService: LoggerService,
    ) {}

    @Post()
    async createNewCitizenAccountController(@Body() citizenDto: CreateCitizenDto, @GetVillageId() villageId: string) {
        this.loggerService.log("POST /citizens");
        const userId = await this.userService.addCitizen(citizenDto, villageId);

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
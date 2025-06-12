import { Body, Controller } from "@nestjs/common";
import AuthDto from "src/application/dto/auth.dto";
import { AuthService } from "src/core/services/auth/auth.service";
import { LoggerService } from "src/infrastructure/logger/logger.service";

@Controller('auth')
class AuthController {
    constructor(
        private logger : LoggerService,
        private authService : AuthService
    ) {}

    async loginAccount(@Body() data: AuthDto) {
        const { accessToken, refreshToken } = await this.authService.authenticateAccount(data);

        return {
            status: true,
            message: "successfully login",
            accessToken,
            refreshToken
        }
    }
}

export default AuthController;
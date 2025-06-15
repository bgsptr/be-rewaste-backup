import { Body, Controller, Post, Res } from "@nestjs/common";
import { Response } from "express";
import AuthDto from "src/application/dto/auth.dto";
import { AuthService } from "src/core/services/auth/auth.service";
import { LoggerService } from "src/infrastructure/logger/logger.service";

@Controller('auth')
class AuthController {
    constructor(
        private logger : LoggerService,
        private authService : AuthService
    ) {}

    @Post("/login")
    async loginAccount(@Body() data: AuthDto, @Res({ passthrough: true }) res: Response) {
        const { userId, accessToken, refreshToken } = await this.authService.authenticateAccount(data);
        
        res.cookie("token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "development",
            sameSite: "strict",
            maxAge: 1 * 60 * 60 * 1000,
        });

        return {
            status: true,
            message: "successfully login",
            data: {
                userId
            },
            accessToken,
            refreshToken
        }
    }
}

export default AuthController;
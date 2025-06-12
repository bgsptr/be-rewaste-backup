import { Module } from "@nestjs/common";
import AuthController from "src/modules/auth/auth.controller";

@Module({
    controllers: [AuthController],
})

export class AuthModule {}
import {  Body, Controller, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { CreateVerificatorDto, IAssignVerificatorDto } from "src/application/dto/verificators/create_verificator.dto";
import { CustomForbidden } from "src/core/exceptions/custom-forbidden.exception";
import { RolesGuard } from "src/core/guards/roles.guard";
import UserService from "src/core/services/users/user.service";
import VerificationService from "src/core/services/verifications/verification.service";
import { LoggerService } from "src/infrastructure/logger/logger.service";
import { FetchJWTPayload } from "src/shared/decorators/fetch-jwt-payload.decorator";
import { Roles } from "src/shared/decorators/roles.decorator";
import { roleNumber } from "src/utils/enum/role.enum";

@Controller("verificators")
class VerificatorController {
    constructor(
        private userService: UserService,
        private loggerService: LoggerService,
        private verificationService: VerificationService,
    ) { }

    @UseGuards(RolesGuard)
    @Roles(roleNumber.ADMIN)
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

    @UseGuards(RolesGuard)
    @Roles(roleNumber.VERIFICATOR)
    @Get('/verification-tasks')
    async getAllVerificationTaskController(@FetchJWTPayload() payload: { id: string }) {
        const verifications = await this.verificationService.listAllVerification(payload.id);

        return {
            success: true,
            message: `successfully fetch all verification tasks for ${new Date().toISOString()}`,
            result: {
                totalVerificationList: verifications.length,
                totalVerified: verifications.filter(verification => verification.verifyStatus).length,
                totalUnverified: verifications.filter(verification => !verification.verifyStatus).length,
                verifications,
            },
        }
    }

    @UseGuards(RolesGuard)
    @Roles(roleNumber.ADMIN)
    @Put('/:verificatorId')
    async updateVerificatorDataController(@Param('verificatorId') id: string, @Body() data: IAssignVerificatorDto) {
        const verificatorId = await this.verificationService.updateVerificatorInformation(id, data);

        return {
            success: true,
            message: `successfully update verificator with id ${verificatorId}`,
        }
    }

    @UseGuards(RolesGuard)
    @Roles(roleNumber.VERIFICATOR)
    @Get('/verification-history')
    async getVerificationHistoryController(@FetchJWTPayload() payload: { id: string }, @Query() qs: { date: string }) {
        const result = await this.verificationService.getVerificationHistory(payload.id, qs.date);

        return {
            success: true,
            message: `successfully fetch all verification history`,
            result: {
                ...result
            },
        }
    }
}

export default VerificatorController;
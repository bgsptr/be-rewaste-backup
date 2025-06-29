import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { RolesGuard } from "src/core/guards/roles.guard";
import VerificationService from "src/core/services/verifications/verification.service";
import { Roles } from "src/shared/decorators/roles.decorator";
import { roleNumber } from "src/utils/enum/role.enum";

@Controller('verifications')
class VerificationController {
    constructor(
        private verificationService: VerificationService
    ) { }

    @UseGuards(RolesGuard)
    @Roles(roleNumber.VERIFICATOR)
    @Get("/:verificationId")
    async getVerificationByIdController(@Param('verificationId') id: string) {
        const data = await this.verificationService.getVerificationDetail(id);

        return {
            success: true,
            message: `successfully fetch verification data with id ${id}`,
            data,
        }
    }
}

export default VerificationController;
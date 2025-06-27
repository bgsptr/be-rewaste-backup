import { Body, Controller, Param, Patch, UseGuards, UsePipes } from "@nestjs/common";
import { assignTransporterRequestSchema, IAssignTransporterRequest } from "src/application/dto/transporter-request/transporter-request.dto";
import { RolesGuard } from "src/core/guards/roles.guard";
import VillageService from "src/core/services/villages/village.service";
import { FetchJWTPayload } from "src/shared/decorators/fetch-jwt-payload.decorator";
import { Roles } from "src/shared/decorators/roles.decorator";
import { ZodValidationPipe } from "src/shared/pipes/zod-validation.pipe";
import { roleNumber } from "src/utils/enum/role.enum";

@Controller('transporter-request')
class TransporterRequestController {
    constructor(
        private villageService: VillageService
    ) {}

    // role village admin
    @UseGuards(RolesGuard)
    @Roles(roleNumber.VILLAGE)
    @Patch("/:transporterId/status")
    // @UsePipes(new ZodValidationPipe())
    async updateTransporter(@FetchJWTPayload() payload: { id: string }, @Param('transporterId') id: string, @Body(new ZodValidationPipe(assignTransporterRequestSchema)) body: { status: IAssignTransporterRequest }) {
        await this.villageService.receiveTransporterRequestToBeenAddedInServiceArea({ villageId: payload.id, transporterId: id, status: body.status });

        return {
            success: true,
            message: "successfully accepted connection between transporter and village"
        }
    }
}

export default TransporterRequestController;
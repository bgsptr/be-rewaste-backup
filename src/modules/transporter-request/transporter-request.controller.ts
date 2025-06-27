import { Body, Controller, Param, Patch, UsePipes } from "@nestjs/common";
import VillageService from "src/core/services/villages/village.service";
import { FetchJWTPayload } from "src/shared/decorators/fetch-jwt-payload.decorator";
import { ZodValidationPipe } from "src/shared/pipes/zod-validation.pipe";

@Controller('transporter-request')
class TransporterRequestController {
    constructor(
        private villageService: VillageService
    ) {}

    // role village admin
    // @Patch("/:transporterId/status")
    // // @UsePipes(new ZodValidationPipe())
    // async updateTransporter(@FetchJWTPayload() payload: { id: string }, @Param() param: { transporterId: string }, @Body() body: { status: "accepted" | "rejected" }) {
    //     // if (body.status === )
    //     const { transporterId } = param;
    //     await this.villageService.receiveTransporterRequestToBeenAddedInServiceArea({ villageId: payload.id, transporterId, status: body.status });
    // }
}

export default TransporterRequestController;
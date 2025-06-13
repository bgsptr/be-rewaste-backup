import { Body, Controller } from "@nestjs/common";
import { CreateTransporterDto } from "src/application/dto/transporter/create_transporter.dto";
import { TransporterService } from "src/core/services/transporters/transporter.service";
import { GetVillageId } from "src/shared/decorators/get-village-id.decorator";

@Controller()
class TransporterController {
    constructor(
        private transporterService: TransporterService,
    ) {}

    async addTransporterController(@Body() transporterDto: CreateTransporterDto, @GetVillageId() villageId: string | null) {
        const transporterId = await this.transporterService.addTransporter(transporterDto, villageId);

        return {
            status: true,
            message: "successfully add transporter",
            data: {
                id: transporterId,
            }
        }
    }
}


export default TransporterController;
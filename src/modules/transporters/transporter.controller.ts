import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { CreateDriverDto } from "src/application/dto/drivers/create_driver.dto";
import { CreateTransporterDto } from "src/application/dto/transporter/create_transporter.dto";
import DriverService from "src/core/services/drivers/driver.service";
import { TransporterService } from "src/core/services/transporters/transporter.service";
import { FetchJWTPayload } from "src/shared/decorators/fetch-jwt-payload.decorator";
import { FindUserId } from "src/shared/decorators/find-user-id.decorator";
import { GetVillageId } from "src/shared/decorators/get-village-id.decorator";
import { RoleIdGenerate } from "src/utils/generator";

@Controller("transporters")
class TransporterController {
    constructor(
        private transporterService: TransporterService,
        private driverService: DriverService,
    ) {}

    @Post()
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

    @Post("/:id/drivers")
    async addDriverBasedTransporterController(@Param() param: { id: string }, @Body() data: CreateDriverDto, @FetchJWTPayload() payload: { id: string, roles: string[] }) {
        // check if user neither admin nor correct transporter with payload jwt userId, throw forbidden
        const { id: transporterIdJWT, roles } = payload;
        if (!roles.includes(RoleIdGenerate.admin)) //throw forbidden

        if (roles.includes(RoleIdGenerate.transporter)) {
            if (transporterIdJWT !== param.id) //throw forbidden
        }
        
        // add dto
        await this.driverService.addDriver(data, transporterIdJWT);

        
    }
}


export default TransporterController;
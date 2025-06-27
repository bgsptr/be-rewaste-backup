// update controller

import { Body, Controller, Get, Param, Patch, Put } from "@nestjs/common";
import { CustomForbidden } from "src/core/exceptions/custom-forbidden.exception";
import CarService from "src/core/services/cars/car.service";
import DriverService from "src/core/services/drivers/driver.service";
import { FetchJWTPayload } from "src/shared/decorators/fetch-jwt-payload.decorator";

@Controller('drivers')
class DriverController {
    constructor(
        private driverService: DriverService,
        private carService: CarService,
    ) {}

    @Get("/:id")
    async getDriverDetailByIdController(@Param() param: { id: string }) {
        const result = await this.driverService.getDriverDetail(param.id);

        return {
            success: true,
            message: `successfully fetch driver with id ${result.userId}`,
            result,
        }
    }
    
    @Patch('/:id/car')
    async assignCarToDriverController(@FetchJWTPayload() payload: { id: string }, @Body() body: { carId: string }, @Param() param: { id: string }) {
        // payload dto boleh driver beserta carId atau carId saja bisa juga
        const { carId } = body;
        // transporter id should be exist
        const carInfo = await this.carService.getCarInformation(carId) ?? null;
        if (payload.id !== carInfo.transporterId) throw new CustomForbidden();

        const car = await this.driverService.updateCarOfTheDriver(body.carId, param.id);
        return {
            success: true,
            message: `successfully update car data with id ${body.carId}`,
            data: {
                car,
            }
        }
    }
}

export default DriverController;
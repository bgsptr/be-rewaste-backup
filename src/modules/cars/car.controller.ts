import { Body, Controller, Get, Post } from "@nestjs/common";
import { CarDto } from "src/application/dto/cars/car.dto";
import { CustomForbidden } from "src/core/exceptions/custom-forbidden.exception";
import CarService from "src/core/services/cars/car.service";
import { FetchJWTPayload } from "src/shared/decorators/fetch-jwt-payload.decorator";
import { roleNumber } from "src/utils/enum/role.enum";

@Controller("cars")
class CarController {
    constructor(
        private carService: CarService,
    ) {}

    @Post()
    async createCarController(@Body() data: CarDto, @FetchJWTPayload() payload: { id: string, roles: string[] }) {
        if (!payload.roles.includes(roleNumber.TRANSPORTER)) throw new CustomForbidden();

        const carId = await this.carService.createCar(data, payload.id);

        return {
            success: true,
            message: "successfully add car",
            data: {
                carId
            }
        }
    }
}

export default CarController;
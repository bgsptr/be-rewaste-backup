import { Body, Controller, Get, Post, UseFilters, UsePipes } from "@nestjs/common";
import { AssignCarDto, assignCarSchema, CarDto, IAssignCarDto } from "src/application/dto/cars/car.dto";
import { CustomForbidden } from "src/core/exceptions/custom-forbidden.exception";
import CarService from "src/core/services/cars/car.service";
import { LoggerService } from "src/infrastructure/logger/logger.service";
import { FetchJWTPayload } from "src/shared/decorators/fetch-jwt-payload.decorator";
import { ZodValidationFilter } from "src/shared/filters/zod.filter";
import { ZodValidationPipe } from "src/shared/pipes/zod-validation.pipe";
import { roleNumber } from "src/utils/enum/role.enum";

@Controller("cars")
class CarController {
    constructor(
        private carService: CarService,
        private logger: LoggerService,
    ) { }

    @Post()
    // @UsePipes(new ZodValidationPipe(AssignCarSchema)) jangan panggil disini karena fungsi transform akan tumpang tindih dengan parameter di body dan dieksekusi 2 kali
    async createCarController(@Body(new ZodValidationPipe(assignCarSchema)) data: IAssignCarDto, @FetchJWTPayload() payload: { id: string, roles: string[] }) {
        this.logger.debug(data);
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

    @Get("/fleet")
    async getFleetOfCarController(@FetchJWTPayload() payload: { id: string }) {
        const data = await this.carService.getFleetInformationWithDriverId(payload.id);

        return {
            success: true,
            message: "data fetched successfully",
            data,
        }
    }
}

export default CarController;
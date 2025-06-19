import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { CreateDriverDto } from "src/application/dto/drivers/create_driver.dto";
import { CreateTransporterDto } from "src/application/dto/transporter/create_transporter.dto";
import { CustomForbidden } from "src/core/exceptions/custom-forbidden.exception";
import CarService from "src/core/services/cars/car.service";
import DriverService from "src/core/services/drivers/driver.service";
import { TransporterService } from "src/core/services/transporters/transporter.service";
import VillageService from "src/core/services/villages/village.service";
import { LoggerService } from "src/infrastructure/logger/logger.service";
import { FetchJWTPayload } from "src/shared/decorators/fetch-jwt-payload.decorator";
import { GetVillageId } from "src/shared/decorators/get-village-id.decorator";
import { roleNumber } from "src/utils/enum/role.enum";
import { generateIdForRole, RoleIdGenerate } from "src/utils/generator";

@Controller("transporters")
class TransporterController {
    constructor(
        private transporterService: TransporterService,
        private driverService: DriverService,
        private carService: CarService,
        private logger: LoggerService,
        private villageService: VillageService,
    ) { }

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
        this.logger.debug(payload);
        const { id: transporterIdJWT, roles } = payload;
        const isAdmin = roles.includes(roleNumber.ADMIN);
        const isTransporter = roles.includes(roleNumber.TRANSPORTER);

        if (!isAdmin) {
            if (isTransporter && String(transporterIdJWT) !== String(param.id)) {
                throw new CustomForbidden();
            }

            if (!isTransporter) {
                throw new CustomForbidden();
            }
        }


        // add dto
        const userId = await this.driverService.addDriver(data, param.id);

        return {
            success: true,
            message: "successfully add new driver",
            data: {
                userId,
            },
        }
    }

    @Get("/:id/drivers")
    async getAllDriverBasedTransporterController(@Param() param: { id: string }, @FetchJWTPayload() payload: { id: string, roles: string[] }, @Query() qs: { available_only: boolean }) {
        // check if user neither admin nor correct transporter with payload jwt userId, throw forbidden
        const { id: transporterIdJWT, roles } = payload;
        const isAdmin = roles.includes(roleNumber.ADMIN);
        const isTransporter = roles.includes(roleNumber.TRANSPORTER);

        if (!isAdmin) {
            if (isTransporter && String(transporterIdJWT) !== String(param.id)) {
                throw new CustomForbidden();
            }

            if (!isTransporter) {
                throw new CustomForbidden();
            }
        }


        // add dto
        const driversNoFilter = await this.driverService.getAllDriversByTransporterId(param.id);

        const drivers = qs.available_only ? driversNoFilter.filter(driver => driver?.driverVillageId === null) : driversNoFilter;

        return {
            success: true,
            message: `successfully fetch all driver from transporter with id ${param.id}`,
            data: {
                drivers
            }
        }

    }

    @Get("/:id/cars")
    async getAllCarDriversController(@Param() param: { id: string }, @FetchJWTPayload() payload: { id: string, roles: string[] }) {
        const { id, roles } = payload;
        // if (!roles.includes(RoleIdGenerate.transporter)) throw forrb
        // if (param.id !== id) throw forbidden
        const cars = await this.carService.getCarWithDriver();

        return cars;
    }

    @Post("/:id/villages")
    async postAllVillagesController(@Param() param: { id: string }, @FetchJWTPayload() payload: { id: string, roles: string[] }, @Body() data: { villageId: string, drivers: string[] }) {
        const { id: transporterIdJWT, roles } = payload;
        const isAdmin = roles.includes(roleNumber.ADMIN);
        const isTransporter = roles.includes(roleNumber.TRANSPORTER);

        if (!isAdmin) {
            if (isTransporter && String(transporterIdJWT) !== String(param.id)) {
                throw new CustomForbidden();
            }

            if (!isTransporter) {
                throw new CustomForbidden();
            }
        }

        await this.transporterService.addServiceArea({
            transporterId: payload.id,
            ...data,
        });

        return {
            success: true,
            message: "successfully add village and add driver to associated village",
        }
    }

    @Get("/:id/villages")
    async getServiceAreaController(@Param() param: { id: string }, @FetchJWTPayload() payload: { id: string, roles: string[] }) {
        const { id: transporterIdJWT, roles } = payload;
        const isAdmin = roles.includes(roleNumber.ADMIN);
        const isTransporter = roles.includes(roleNumber.TRANSPORTER);

        if (!isAdmin) {
            if (isTransporter && String(transporterIdJWT) !== String(param.id)) {
                throw new CustomForbidden();
            }

            if (!isTransporter) {
                throw new CustomForbidden();
            }
        }

        const result = await this.villageService.getServiceAreaServedByTransporter(transporterIdJWT);

        return {
            success: true,
            message: "service area fetched successfully",
            result,
        }
    }
}


export default TransporterController;
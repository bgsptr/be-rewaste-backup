import { Body, Controller, Get, Post } from "@nestjs/common";
import { CreateVillageDto } from "src/application/dto/villages/create_village.dto";
import VillageService from "src/core/services/villages/village.service";
import { LoggerService } from "src/infrastructure/logger/logger.service";

@Controller('villages')
class VillageController {
    constructor(
        private logger: LoggerService,
        private villageService: VillageService,
    ) { }

    @Post()
    async createNewVillageController(@Body() createVillageDto: CreateVillageDto) {
        // add zod to validate and error handling
        const village = await this.villageService.addVillageToRepo(createVillageDto);
        this.logger.log(village);
        return {
            status: true,
            message: `successfully create village with id ${village.villageId}`,
            data: {
                village
            }
        }
    }

    @Get()
    async findAllVillagesController() {
        const villages = await this.villageService.listAllVillages();

        return {
            status: true,
            message: "successfully fetch all villages",
            data: {
                villages,
            }
        }
    }
}

export default VillageController;
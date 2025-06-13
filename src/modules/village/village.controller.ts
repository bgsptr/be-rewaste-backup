import { Body, Controller, Post } from "@nestjs/common";
import { CreateVillageDto } from "src/application/dto/villages/create_village.dto";
import VillageService from "src/core/services/villages/village.service";

@Controller('village')
class VillageController {
    constructor(
        private villageService: VillageService,
    ) {}

    @Post()
    async createNewVillageController(@Body() createVillageDto: CreateVillageDto) {
        // add zod to validate and error handling
        const village = await this.villageService.addVillageToRepo(createVillageDto);
        return {
            status: true,
            message: `successfully create village with id ${village.villageId}`,
            deta: {
                village
            }
        }
    }
}

export default VillageController;
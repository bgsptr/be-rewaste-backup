import { Body, Controller, Post } from "@nestjs/common";
import { CreateVillageDto } from "src/application/dto/villages/create_village.dto";
import VillageService from "src/core/services/village/village.service";

@Controller('village')
class VillageController {
    constructor(
        private villageService: VillageService,
    ) {}

    @Post()
    async createNewVillageController(@Body() createVillageDto: CreateVillageDto) {
        // add zod to validate and error handling
        return await this.villageService.addVillageToRepo(createVillageDto);
    }
}
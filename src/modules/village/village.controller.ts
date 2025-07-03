import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { CreateVillageDto } from 'src/application/dto/villages/create_village.dto';
import { UpdateVillageProfileDto } from 'src/application/dto/villages/update_village_profile.dto';
import VillageService from 'src/core/services/villages/village.service';
import { LoggerService } from 'src/infrastructure/logger/logger.service';
import { FetchJWTPayload } from 'src/shared/decorators/fetch-jwt-payload.decorator';

@Controller('villages')
class VillageController {
  constructor(
    private logger: LoggerService,
    private villageService: VillageService,
  ) {}

  @Get('/hello')
  async getHelloWorld() {
    return {
      success: true,
      message: 'hello world',
    };
  }

  @Post()
  async createNewVillageController(@Body() createVillageDto: CreateVillageDto) {
    // add zod to validate and error handling
    const village =
      await this.villageService.addVillageToRepo(createVillageDto);
    this.logger.log(village);
    return {
      status: true,
      message: `successfully create village with id ${village.villageId}`,
      data: {
        village,
      },
    };
  }

  @Get()
  async findAllVillagesController() {
    const villages = await this.villageService.listAllVillages();

    return {
      status: true,
      message: 'successfully fetch all villages',
      data: {
        villages,
      },
    };
  }

  @Put()
  async updateVillageController(
    @Body() villageDto: UpdateVillageProfileDto,
    @FetchJWTPayload() payload: { id: string },
  ) {
    const data = await this.villageService.updateVillageProfile(
      villageDto,
      payload.id,
    );

    return {
      status: true,
      message: 'successfully update village profile',
      data,
    };
  }

  @Get('/dashboard')
  async getDashbaordVillageController() {}
}

export default VillageController;

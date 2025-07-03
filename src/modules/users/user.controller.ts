import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import { CreateCitizenDto } from 'src/application/dto/citizens/create_citizen.dto';
import { CustomForbidden } from 'src/core/exceptions/custom-forbidden.exception';
import UserService from 'src/core/services/users/user.service';
import VerificationService from 'src/core/services/verifications/verification.service';
import VillageService from 'src/core/services/villages/village.service';
import { LoggerService } from 'src/infrastructure/logger/logger.service';
import { FetchJWTPayload } from 'src/shared/decorators/fetch-jwt-payload.decorator';
import { roleNumber } from 'src/utils/enum/role.enum';

@Controller('citizens')
class UserController {
  constructor(
    private userService: UserService,
    private loggerService: LoggerService,
    private verificationService: VerificationService,
    private villageService: VillageService,
  ) {}

  @Post()
  async createNewCitizenAccountController(
    @Body() citizenDto: CreateCitizenDto,
    @FetchJWTPayload() payload: { id: string; roles: string[] },
  ) {
    this.loggerService.log('POST /citizens');
    this.loggerService.debug(payload);
    if (!payload) throw new CustomForbidden();
    const userId = await this.userService.addCitizen(citizenDto, payload.id);

    return {
      status: true,
      message: `successfully add user with id ${userId}`,
      data: {
        userId,
      },
    };
  }

  @Get('/me/profile')
  async getCitizenProfileController(
    @FetchJWTPayload() payload: { id: string; activeRole: string },
  ) {
    const { id: userId, activeRole } = payload;

    let finalData;

    switch (activeRole) {
      case roleNumber.CITIZEN: {
        finalData = await this.userService.getCitizenProfile(userId);
        break;
      }
      case roleNumber.VERIFICATOR: {
        const verificator =
          await this.userService.getVerificatorProfile(userId);
        const performance =
          await this.verificationService.getVerificatorPerformance(userId);

        finalData = {
          verificator,
          performance,
        };
        break;
      }
      case roleNumber.DRIVER: {
        finalData = await this.userService.getDriverProfile(userId);
        break;
      }
      case roleNumber.VILLAGE: {
        finalData = {
          profile:
            await this.villageService.getVillageProfileByVillageId(userId),
        };
        break;
      }
      case roleNumber.ADMIN: {
        finalData = await this.userService.getSuperAdminProfile(userId);
        break;
      }
      default:
        throw new BadRequestException('Role does not exist');
    }

    return {
      status: true,
      message: `Successfully fetched profile for user with ID ${userId}`,
      data: finalData,
    };
  }
}

export default UserController;

import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CustomForbidden } from 'src/core/exceptions/custom-forbidden.exception';
import { RolesGuard } from 'src/core/guards/roles.guard';
import AddressService from 'src/core/services/addresses/address.service';
import TrashService from 'src/core/services/trash/trash.service';
import UserService from 'src/core/services/users/user.service';
import { LoggerService } from 'src/infrastructure/logger/logger.service';
import { FetchJWTPayload } from 'src/shared/decorators/fetch-jwt-payload.decorator';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { roleNumber } from 'src/utils/enum/role.enum';

@Controller('trash')
class TrashController {
  constructor(
    private trashService: TrashService,
    private addressService: AddressService,
    private logger: LoggerService,
  ) {}

  @Get('/pickup-list')
  async listAllPickupsController(@FetchJWTPayload() payload: { id: string }) {
    const pickupList = await this.trashService.getDailyPickupList(payload.id);

    return {
      success: true,
      message: 'successfully fetch all pickup list',
      result: {
        pickupList,
      },
    };
  }

  @Roles(roleNumber.CITIZEN)
  @UseGuards(RolesGuard)
  @Get()
  async getAllHistoryTrashOfUser(@FetchJWTPayload() payload: { id: string }) {
    // bisa pagination filter by per month;
    const items = await this.trashService.getTrashHistories(payload.id);

    return {
      success: true,
      message: 'successfully fetch all trash histories',
      result: items.map((item) => ({
        id: item.id,
        pickupStatus: item.pickupStatus,
        createdAt: item.createdAt,
        point: item.point,
        trashTypes: item.trashTypes.map((tType) => ({
          weight: tType.weight,
          trashTypeId: tType.trashTypeId,
          name: tType.trashType.name,
        })),
      })),
    };
  }

  @Get('/daily')
  async getDailyTrashController(@FetchJWTPayload() payload: { id: string }) {
    await this.addressService.checkAddressIsExistService(payload.id);
    const data = await this.trashService.getDailyTrashInformation(payload.id);

    return {
      success: true,
      message: `successfully fetch today trash for user with id ${payload.id}`,
      data,
    };
  }

  @Roles(roleNumber.CITIZEN)
  @UseGuards(RolesGuard)
  @Get('/:id')
  async getTrashByIdController(
    @Param() param: { id: string },
    @FetchJWTPayload() payload: { id: string },
  ) {
    this.logger.log(`GET /trash/${param.id}`);
    const data = await this.trashService.getTrashById(param.id, payload.id);
    return {
      success: true,
      message: `trash with id: ${param.id} fetched successfully`,
      data,
    };
  }

  // guard for only driver role
  @Roles(roleNumber.DRIVER)
  @UseGuards(RolesGuard)
  @Patch('/:id/pickup')
  async driverScanTrashQRCodeController(
    @FetchJWTPayload() payload: { id: string },
    @Param() param: { id: string },
  ) {
    const { id: trashId } = param;
    await this.trashService.updateTrashStatusToNeedVerify(trashId, payload.id);

    return {
      success: true,
      message: `success update status after pickup trash with id ${trashId}`,
    };
  }

  @Roles(roleNumber.DRIVER)
  @UseGuards(RolesGuard)
  @Patch('/:id/scheduled')
  async driverClickStartInPickupListController(
    @FetchJWTPayload() payload: { id: string },
    @Param() param: { id: string },
  ) {
    const { id: trashId } = param;
    if (!payload) throw new CustomForbidden();
    await this.trashService.updateStatusToSchedule(trashId, payload.id);

    return {
      success: true,
      message: `success update status after pickup trash with id ${trashId}`,
    };
  }

  @UseGuards(RolesGuard)
  @Roles(roleNumber.DRIVER)
  @Get('/me/pickup-timeline')
  async getPickupSchedulePerDayController(
    @Query() qs: { date: string },
    @FetchJWTPayload() payload: { id: string },
  ) {
    const trash = await this.trashService.getPickupListForDriverTimeline(
      payload.id,
      qs.date,
    );

    return {
      success: true,
      message: `successfully fetch pickup timeline for date ${qs.date}`,
      data: {
        trash,
      },
    };
  }
}

export default TrashController;

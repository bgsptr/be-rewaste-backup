import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { join } from 'path';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  AssignVerificationDto,
  assignVerificationSchema,
  IAssignVerification,
} from 'src/application/dto/verifications/verification.dto';
import { multerVerificationConfig } from 'src/core/config/multer-verification.config';
import { CustomBadRequest } from 'src/core/exceptions/custom-bad-request.exception';
import { RolesGuard } from 'src/core/guards/roles.guard';
import VerificationService from 'src/core/services/verifications/verification.service';
import { FetchJWTPayload } from 'src/shared/decorators/fetch-jwt-payload.decorator';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { roleNumber } from 'src/utils/enum/role.enum';
import { url } from 'src/shared/constants/baseurl.constant';

type RawAssignVerificationForm = {
  organicWeight: string;
  anorganicWeight: string;
  residuWeight: string;
  verificationNote?: string;
};

type RawImageVerificationForm = {
  organic?: Express.Multer.File[];
  anorganic?: Express.Multer.File[];
  residu?: Express.Multer.File[];
};

@Controller('verifications')
class VerificationController {
  constructor(private verificationService: VerificationService) {}

  @UseGuards(RolesGuard)
  @Roles(roleNumber.VERIFICATOR)
  @Get('/:verificationId')
  async getVerificationByIdController(
    @Param('verificationId') id: string,
    @FetchJWTPayload() payload: { id: string },
  ) {
    const data = await this.verificationService.getVerificationDetail(
      id,
      payload.id,
    );

    return {
      success: true,
      message: `successfully fetch verification data with id ${id}`,
      data,
    };
  }

  @UseGuards(RolesGuard)
  @Roles(roleNumber.VERIFICATOR)
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        {
          name: 'organic',
          maxCount: 1,
        },
        {
          name: 'anorganic',
          maxCount: 1,
        },
        {
          name: 'residu',
          maxCount: 1,
        },
      ],
      multerVerificationConfig,
    ),
  )
  async postNewVerificationController(
    @UploadedFiles() files: RawImageVerificationForm,
    @Body() body: RawAssignVerificationForm,
    @FetchJWTPayload() payload: { id: string },
  ) {
    // folder di mapping berdasarkan verificator yang mengupload foto dan melakukan validasi
    const uploadDir = `${url.baseUrl}/uploads/images/${payload.id}`;

    // fix bug validasi image multiple file and keyname
    const dto = {
      ...body,
      organicImage: join(uploadDir, files.organic?.[0].filename ?? ''),
      anorganicImage: join(uploadDir, files.anorganic?.[0].filename ?? ''),
      residuImage: join(uploadDir, files.residu?.[0].filename ?? ''),
      organicWeight: parseFloat(body.organicWeight),
      anorganicWeight: parseFloat(body.anorganicWeight),
      residuWeight: parseFloat(body.residuWeight),
    };

    const result = assignVerificationSchema.safeParse(dto);

    if (!result.success) {
      throw new BadRequestException(result.error.format());
    }

    const data: IAssignVerification = result.data;

    await this.verificationService.createVerification(data, payload.id);

    return {
      success: true,
      message: 'successfully create verification data',
    };
  }
}

export default VerificationController;

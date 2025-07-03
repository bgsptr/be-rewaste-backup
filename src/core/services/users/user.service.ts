import { Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CreateCitizenDto } from 'src/application/dto/citizens/create_citizen.dto';
import { CreateVerificatorDto } from 'src/application/dto/verificators/create_verificator.dto';
import { CitizenMapper } from 'src/application/mapper/citizen.mapper';
import { VerificatorMapper } from 'src/application/mapper/verificator.mapper';
import { CustomConflict } from 'src/core/exceptions/custom-conflict.exception';
import { CustomForbidden } from 'src/core/exceptions/custom-forbidden.exception';
import { NotFoundException } from 'src/core/exceptions/not-found.exception';
import { LoggerService } from 'src/infrastructure/logger/logger.service';
import PointRepository from 'src/infrastructure/postgres/repositories/point.repository';
import UserRoleRepository from 'src/infrastructure/postgres/repositories/user-role.repository';
import UsersRepository from 'src/infrastructure/postgres/repositories/users.repository';
import VillageRepository from 'src/infrastructure/postgres/repositories/village.repository';
import { credential } from 'src/shared/constants/credential.constant';
import { roleNumber } from 'src/utils/enum/role.enum';
import { generateIdWithNano } from 'src/utils/generator';
import { Hasher } from 'src/utils/static/hasher';
import PrismaService from '../prisma/prisma.service';
import AddressRepository from 'src/infrastructure/postgres/repositories/address.repository';
import { JoinStatus } from '@prisma/client';
import { CustomBadRequest } from 'src/core/exceptions/custom-bad-request.exception';

@Injectable()
class UserService {
  constructor(
    private userRepository: UsersRepository,
    private userRoleRepository: UserRoleRepository,
    private citizenMapper: CitizenMapper,
    private verificatorMapper: VerificatorMapper,
    private logger: LoggerService,
    private pointRepository: PointRepository,
    private villageRepository: VillageRepository,
    private prisma: PrismaService,
  ) {}

  // role village yang create
  async addCitizen(data: CreateCitizenDto, villageId: string): Promise<string> {
    this.logger.log('add citizen service');
    const staticHashPassword = await Hasher.hashPassword(credential.password);
    const citizenSendToEntity = this.citizenMapper.toEntity(
      data,
      villageId,
      staticHashPassword,
    );
    this.logger.log(citizenSendToEntity);

    const userId =
      await this.userRepository.registerAccountFullData(citizenSendToEntity);
    await this.userRoleRepository.addRole(userId, roleNumber.CITIZEN);

    await this.pointRepository.create({
      pointId: `POINT-${generateIdWithNano()}`,
      userId,
      lifetimePoint: 0,
      remainPoint: 0,
    });

    return userId;
  }

  // async addVerificator(data: CreateVerificatorDto): Promise<string> {
  //     try {
  //         if (data.villageId) {
  //             const village = await this.villageRepository.getById(data.villageId);
  //             if (!village) throw new NotFoundException('village');
  //             if (village.userVerificatorId) throw new CustomConflict('village', village.id, 'verificator already assigned to this village');
  //         }
  //         this.logger.log("add verificator service");

  //         const staticHashPassword = await Hasher.hashPassword(credential.password);
  //         const { villageId, ...restDto } = data;
  //         const mappedVerificatorData = this.verificatorMapper.toEntity({ villageId: null, ...restDto }, staticHashPassword);
  //         this.logger.log(mappedVerificatorData);

  //         const userId = await this.userRepository.registerAccountFullData(mappedVerificatorData);
  //         await this.userRoleRepository.addRole(userId, roleNumber.VERIFICATOR);

  //         // update verificator id column in village table with selected body village id
  //         if (villageId) await this.villageRepository.update({ id: villageId, userVerificatorId: userId });
  //         return userId;
  //     } catch (err) {
  //         this.logger.error(err);
  //         if (err instanceof PrismaClientKnownRequestError && err.code === "P2025") throw new NotFoundException('verificator');
  //         // if (err instanceof PrismaClientKnownRequestError) throw new CustomConflict('verificator');
  //         throw err;
  //     }
  // }

  // transaction version
  async addVerificator(data: CreateVerificatorDto): Promise<string> {
    const { villageId, ...restDto } = data;
    const hashedPassword = await Hasher.hashPassword(credential.password);
    const mappedUser = this.verificatorMapper.toEntity(
      { villageId: null, ...restDto },
      hashedPassword,
    );

    try {
      const userId = await this.prisma.$transaction(async (tx) => {
        // Step 1: Validasi Village jika ada
        if (villageId) {
          const village = await tx.village.findUnique({
            where: { id: villageId },
            select: { id: true, userVerificatorId: true },
          });

          if (!village) throw new NotFoundException('village');
          if (village.userVerificatorId)
            throw new CustomConflict(
              'village',
              village.id,
              'verificator already assigned to this village',
            );
        }

        // Step 2: Buat user
        const user = await tx.user.create({ data: mappedUser });

        // Step 3: Tambah role
        await tx.userRoles.create({
          data: {
            userId: user.userId,
            roleId: roleNumber.VERIFICATOR,
          },
        });

        // Step 4: Update village (jika ada)
        if (villageId) {
          await tx.village.update({
            where: { id: villageId },
            data: { userVerificatorId: user.userId },
          });
        }

        return user.userId;
      });

      return userId;
    } catch (err) {
      this.logger.error(err);

      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2025') throw new NotFoundException('verificator');
        if (err.code === 'P2003')
          throw new CustomConflict(
            'constraint error',
            '',
            'foreign key violation',
          );
      }

      throw err;
    }
  }

  async getCitizenWithStatusDraft(userId: string) {
    const user = await this.userRepository.getSelfInformation(userId);
    if (!user || !user?.driverVillageId)
      throw new CustomForbidden('driver is not allowed to get pickup route');
    this.logger.debug(user.driverVillageId);

    if (!user.transporterId)
      throw new CustomForbidden('driver not associated to any transporter');
    // await this.villageService.validateLinkedVillage();

    const linked = await this.villageRepository.getLinkedProposal(
      user.transporterId,
      user.driverVillageId,
    );
    this.logger.debug(linked);

    if (
      linked?.transporterVillage.find(
        (village) => village.villageId === user.driverVillageId,
      )?.joinStatus !== JoinStatus.Accepted
    )
      throw new NotFoundException('trash');

    const data = await this.userRepository.getActiveCitizensWithTodayDraftTrash(
      user.driverVillageId,
    );

    return data;
  }

  async getProfileByUserId(userId: string, activeRole: string) {
    switch (activeRole) {
      case roleNumber.CITIZEN:
        return await this.getCitizenProfile(userId);
      case roleNumber.VERIFICATOR:
        return await this.getVerificatorProfile(userId);
      case roleNumber.DRIVER:
        await this.getDriverProfile(userId);
      case roleNumber.VILLAGE:
        await this.getVillageAdminProfile(userId);
      case roleNumber.ADMIN:
        await this.getSuperAdminProfile(userId);
      default:
        throw new CustomBadRequest('role does not exist');
    }
  }

  async getCitizenProfile(userId: string) {
    return await this.userRepository.getCitizenDetailByCitizenId(userId);
  }

  async getVerificatorProfile(verificatorId: string) {
    return await this.userRepository.getVerificatorDataById(verificatorId);
  }

  async getDriverProfile(driverId: string) {
    return await this.userRepository;
  }

  async getVillageAdminProfile(villageId: string) {
    // return await this.userRepository.;
    return await this.userRepository.getVillageById(villageId);
  }

  async getSuperAdminProfile(adminId: string) {
    return await this.userRepository;
  }
}

export default UserService;

import { Injectable } from '@nestjs/common';
import { JoinStatus, User } from '@prisma/client';
import { IAssignTransporterRequest } from 'src/application/dto/transporter-request/transporter-request.dto';
import { CreateVillageDto } from 'src/application/dto/villages/create_village.dto';
import { VillageMapper } from 'src/application/mapper/village.mapper';
import { CustomConflict } from 'src/core/exceptions/custom-conflict.exception';
import { CustomForbidden } from 'src/core/exceptions/custom-forbidden.exception';
import { NotFoundException } from 'src/core/exceptions/not-found.exception';
import { LoggerService } from 'src/infrastructure/logger/logger.service';
import TransporterVillageRepository from 'src/infrastructure/postgres/repositories/transporter-village.repository';
import UserRoleRepository from 'src/infrastructure/postgres/repositories/user-role.repository';
import UsersRepository from 'src/infrastructure/postgres/repositories/users.repository';
import VillageRepository from 'src/infrastructure/postgres/repositories/village.repository';
import { roleNumber } from 'src/utils/enum/role.enum';
import { Hasher } from 'src/utils/static/hasher';

interface TransporterRequestServiceParameter {
  villageId: string;
  transporterId: string;
  status: IAssignTransporterRequest;
}

@Injectable()
export class VillageService {
  constructor(
    private logger: LoggerService,
    private villageRepository: VillageRepository,
    private usersRepository: UsersRepository,
    private villageMapper: VillageMapper,
    private userRoleRepository: UserRoleRepository,
    private transporterVillageRepository: TransporterVillageRepository,
  ) {}

  // shared method with other service
  async validateLinkedVillage(
    transporterId: string,
    driverVillageId: string,
  ): Promise<void> {
    const linked = await this.villageRepository.getLinkedProposal(
      transporterId,
      driverVillageId,
    );
    this.logger.debug(linked);

    const joinStatus = linked?.transporterVillage.find(
      (village) => village.villageId === driverVillageId,
    )?.joinStatus;

    if (joinStatus !== JoinStatus.Accepted) {
      throw new NotFoundException('trash');
    }
  }

  async addVillageToRepo(dto: CreateVillageDto) {
    // create village
    const entity = this.villageMapper.toEntity(dto);
    const villageId = await this.villageRepository.addVillage(entity);

    // create village entity
    const accountData: Partial<User> = {
      userId: villageId,
      villageId,
      email: dto.email,
    };

    const password = await Hasher.hashPassword('village123');
    // create account for village
    const userIdGenerated = await this.usersRepository.registerAccount(
      accountData,
      password,
    );

    // add role
    await this.userRoleRepository.addRole(userIdGenerated, roleNumber.VILLAGE);

    // return response
    return this.villageMapper.toResponse(entity);
  }

  async listAllVillages() {
    this.logger.log('list all village service');

    const villages = await this.villageRepository.getAll();
    this.logger.log(villages);
    return villages.map((village) => ({
      ...village,
      transporterCount: village.transporterVillage.length,
    }));
  }

  async getServiceAreaServedByTransporter(transporterId: string) {
    const datas =
      await this.villageRepository.getVillageWithFamilyCountAndDriver(
        transporterId,
      );
    const acceptedLinkedDatas = datas.filter(
      (data) =>
        data.transporterVillage.find((tV) => tV.transporterId === transporterId)
          ?.joinStatus === JoinStatus.Accepted,
    );
    // const totalAreaServed = datas.length;
    // const totalFamilyServed = datas.reduce((total, data) => total + data._count.users, 0);
    // const totalDriverAssigned = datas.reduce((total, data) => total + data._count.drivers, 0);

    const totalAreaServed = acceptedLinkedDatas.length;
    const totalFamilyServed = acceptedLinkedDatas.reduce(
      (total, data) => total + data._count.users,
      0,
    );
    const totalDriverAssigned = acceptedLinkedDatas.reduce(
      (total, data) => total + data._count.drivers,
      0,
    );

    // this.logger.debug(datas);

    const mapNewArea = datas.map((data) => ({
      id: data.id,
      totalDriver: data._count.drivers,
      totalFamily: data._count.users,
      name: data.villageName,
      regency: data.regency,
      joinStatus: data.transporterVillage.find(
        (village) => village.transporterId === transporterId,
      )?.joinStatus,
      linkedAt: data.transporterVillage.find(
        (village) => village.transporterId === transporterId,
      )?.linkedAt,
    }));

    return {
      totalAreaServed,
      totalFamilyServed,
      totalDriverAssigned,
      villages: mapNewArea,
    };
  }

  async receiveTransporterRequestToBeenAddedInServiceArea(
    data: TransporterRequestServiceParameter,
  ) {
    const { status: bodyContainingStatus, villageId, transporterId } = data;

    const isLinked = await this.transporterVillageRepository.get(
      transporterId,
      villageId,
    );
    if (!isLinked) throw new NotFoundException('linked-transporter-village');
    // if (isLinked && isLinked.joinStatus !== JoinStatus.Pending) throw new CustomConflict('transporter-village', '', 'status of proposal must be a pending');
    // this.logger.debug(bodyContainingStatus); //"Accepted"
    const statusDefined =
      (bodyContainingStatus as unknown) === JoinStatus.Accepted;
    this.logger.debug(statusDefined);
    await this.transporterVillageRepository.updateStatus(
      statusDefined,
      transporterId,
      villageId,
    );
  }
}

export default VillageService;

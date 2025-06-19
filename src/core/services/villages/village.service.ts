import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { CreateVillageDto } from "src/application/dto/villages/create_village.dto";
import { VillageMapper } from "src/application/mapper/village.mapper";
import { LoggerService } from "src/infrastructure/logger/logger.service";
import UserRoleRepository from "src/infrastructure/postgres/repositories/user-role.repository";
import UsersRepository from "src/infrastructure/postgres/repositories/users.repository";
import VillageRepository from "src/infrastructure/postgres/repositories/village.repository";
import { roleNumber } from "src/utils/enum/role.enum";
import { Hasher } from "src/utils/static/hasher";

@Injectable()
export class VillageService {
    constructor(
        private logger: LoggerService, 
        private villageRepository: VillageRepository,
        private usersRepository: UsersRepository,
        private villageMapper: VillageMapper,
        private userRoleRepository: UserRoleRepository,
    ) { }

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

        const password = await Hasher.hashPassword("village123");
        // create account for village
        const userIdGenerated = await this.usersRepository.registerAccount(accountData, password);

        // add role
        await this.userRoleRepository.addRole(userIdGenerated, roleNumber.VILLAGE);

        // return response
        return this.villageMapper.toResponse(entity);
    }

    async listAllVillages() {
        this.logger.log("list all village service");

        const villages = await this.villageRepository.getAll();
        this.logger.log(villages);
        return villages.map(village => ({
            ...village,
            transporterCount: village.transporterVillage.length,
        }))
    }

    async getServiceAreaServedByTransporter(transporterId: string) {
        const datas = await this.villageRepository.getVillageWithFamilyCountAndDriver(transporterId);
        const totalAreaServed = datas.length;
        const totalFamilyServed = datas.reduce((total, data) => total + data._count.users, 0);
        const totalDriverAssigned = datas.reduce((total, data) => total + data._count.drivers, 0);
        const mapNewArea = datas.map(data => ({
            id: data.id,
            totalDriver: data._count.drivers,
            totalFamily: data._count.users,
            name: data.villageName,
            regency: data.regency,
        }));

        return {
            totalAreaServed,
            totalFamilyServed,
            totalDriverAssigned,
            villages: mapNewArea,
        };
    }
}

export default VillageService;
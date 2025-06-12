import { User } from "@prisma/client";
import { CreateVillageDto } from "src/application/dto/villages/create_village.dto";
import { VillageMapper } from "src/application/mapper/village.mapper";
import { LoggerService } from "src/infrastructure/logger/logger.service";
import UserRoleRepository from "src/infrastructure/postgres/repositories/user-role.repository";
import UsersRepository from "src/infrastructure/postgres/repositories/users.repository";
import VillageRepository from "src/infrastructure/postgres/repositories/village.repository";
import { roleEnum } from "src/utils/enum/role.enum";
import { generateId, generateIdForRole, RoleIdGenerate } from "src/utils/generator";

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
            userId: generateIdForRole(RoleIdGenerate.village),
            villageId
        };

        // create account for village
        const userIdGenerated = await this.usersRepository.registerAccount(accountData);

        // add role
        await this.userRoleRepository.addRole(userIdGenerated, roleEnum.VILLAGE);

        // return response
        return this.villageMapper.toResponse(entity);
    }
}

export default VillageService;
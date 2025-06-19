import { Injectable } from "@nestjs/common";
import { CreateCitizenDto } from "src/application/dto/citizens/create_citizen.dto";
import { CreateVerificatorDto } from "src/application/dto/verificators/create_verificator.dto";
import { CitizenMapper } from "src/application/mapper/citizen.mapper";
import { VerificatorMapper } from "src/application/mapper/verificator.mapper";
import { CustomForbidden } from "src/core/exceptions/custom-forbidden.exception";
import { LoggerService } from "src/infrastructure/logger/logger.service";
import PointRepository from "src/infrastructure/postgres/repositories/point.repository";
import UserRoleRepository from "src/infrastructure/postgres/repositories/user-role.repository";
import UsersRepository from "src/infrastructure/postgres/repositories/users.repository";
import { credential } from "src/shared/constants/credential.constant";
import { roleNumber } from "src/utils/enum/role.enum";
import { generateIdWithNano } from "src/utils/generator";
import { Hasher } from "src/utils/static/hasher";

@Injectable()
class UserService {
    constructor(
        private userRepository: UsersRepository,
        private userRoleRepository: UserRoleRepository,
        private citizenMapper: CitizenMapper,
        private verificatorMapper: VerificatorMapper,
        private logger: LoggerService,
        private pointRepository: PointRepository,
    ) { }

    // role village yang create
    async addCitizen(data: CreateCitizenDto, villageId: string): Promise<string> {
        this.logger.log("add citizen service");
        const staticHashPassword = await Hasher.hashPassword(credential.password);
        const citizenSendToEntity = this.citizenMapper.toEntity(data, villageId, staticHashPassword);
        this.logger.log(citizenSendToEntity);

        const userId = await this.userRepository.registerAccountFullData(citizenSendToEntity);
        await this.userRoleRepository.addRole(userId, roleNumber.CITIZEN);

        await this.pointRepository.create({
            pointId: `POINT-${generateIdWithNano()}`,
            userId,
            lifetimePoint: 0,
            remainPoint: 0,
        });

        return userId;
    }

    async addVerificator(data: CreateVerificatorDto): Promise<string> {
        this.logger.log("add verificator service");

        const staticHashPassword = await Hasher.hashPassword(credential.password);
        const mappedVerificatorData = this.verificatorMapper.toEntity(data, staticHashPassword);
        this.logger.log(mappedVerificatorData);

        const userId = await this.userRepository.registerAccountFullData(mappedVerificatorData);
        await this.userRoleRepository.addRole(userId, roleNumber.VERIFICATOR);

        // update verificator id column in village table with selected body village id

        return userId;
    }

    async getCitizenWithStatusDraft(userId: string) {
        const user = await this.userRepository.getSelfInformation(userId);
        if (!user || !user?.driverVillageId) throw new CustomForbidden("driver is not allowed to get pickup route");
        this.logger.debug(user.driverVillageId);
        const data = await this.userRepository.getActiveCitizensWithTodayDraftTrash(user.driverVillageId);

        return data;
    }
}

export default UserService;
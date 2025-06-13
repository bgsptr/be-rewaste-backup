import { Injectable } from "@nestjs/common";
import { CreateCitizenDto } from "src/application/dto/citizens/create_citizen.dto";
import { CitizenMapper } from "src/application/mapper/citizen.mapper";
import { LoggerService } from "src/infrastructure/logger/logger.service";
import UsersRepository from "src/infrastructure/postgres/repositories/users.repository";
import { credential } from "src/shared/constants/credential.constant";
import { Hasher } from "src/utils/static/hasher";

@Injectable()
class UserService {
    constructor(
        private userRepository: UsersRepository,
        private citizenMapper: CitizenMapper,
        private logger: LoggerService,
    ) { }

    // role village yang create
    async addCitizen(data: CreateCitizenDto, villageId: string): Promise<string> {
        this.logger.log("add citizen service");
        const staticHashPassword = await Hasher.hashPassword(credential.password);
        const citizenSendToEntity = this.citizenMapper.toEntity(data, villageId, staticHashPassword);
        this.logger.log(citizenSendToEntity);

        return await this.userRepository.registerAccountFullData(citizenSendToEntity);
    }
}

export default UserService;
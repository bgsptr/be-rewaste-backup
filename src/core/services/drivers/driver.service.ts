import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { CreateDriverDto } from "src/application/dto/drivers/create_driver.dto";
import { LoggerService } from "src/infrastructure/logger/logger.service";
import UserRoleRepository from "src/infrastructure/postgres/repositories/user-role.repository";
import UsersRepository from "src/infrastructure/postgres/repositories/users.repository";
import { RolesEnum } from "src/shared/constants/roles.contants";
import { roleEnum } from "src/utils/enum/role.enum";
import { generateIdForRole, RoleIdGenerate } from "src/utils/generator";

@Injectable()
class DriverService {
    constructor(
        private userRepository: UsersRepository,
        private userRoleRepository: UserRoleRepository,
        private logger: LoggerService,
    ) {}

    async addDriver(data: CreateDriverDto, transporterId?: string) {
        // create account
        const { name, email, phone, sim_number } = data;
        const partialUser: Partial<User> = {
            userId: generateIdForRole(RoleIdGenerate.driver),
            fullName: name,
            email,
            phoneNumber: phone,
            simNo: sim_number,
            transporterId,
        }

        const userId = await this.userRepository.registerAccount(partialUser);

        // add role to driver
        await this.userRoleRepository.addRole(userId, roleEnum.DRIVER);

        return userId;
    }
}

export default DriverService;
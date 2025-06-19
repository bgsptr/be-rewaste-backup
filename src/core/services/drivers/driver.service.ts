import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { CreateDriverDto } from "src/application/dto/drivers/create_driver.dto";
import { NotFoundException } from "src/core/exceptions/not-found.exception";
import { LoggerService } from "src/infrastructure/logger/logger.service";
import RatingRepository from "src/infrastructure/postgres/repositories/rating.repository";
import UserRoleRepository from "src/infrastructure/postgres/repositories/user-role.repository";
import UsersRepository from "src/infrastructure/postgres/repositories/users.repository";
import { roleNumber } from "src/utils/enum/role.enum";
import { generateIdForRole, RoleIdGenerate } from "src/utils/generator";
import DayConvertion from "src/utils/static/dayjs";
import { Hasher } from "src/utils/static/hasher";

@Injectable()
class DriverService {
    constructor(
        private userRepository: UsersRepository,
        private userRoleRepository: UserRoleRepository,
        private ratingRepository: RatingRepository,
        private logger: LoggerService,
    ) { }

    async addDriver(data: CreateDriverDto, transporterId?: string) {
        try {
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

            const password = await Hasher.hashPassword("driver123");

            const userId = await this.userRepository.registerAccount(partialUser, password);

            // add role to driver
            await this.userRoleRepository.addRole(userId, roleNumber.DRIVER);

            return userId;
        }
        catch (err) {
            this.logger.error(err);
            if (err instanceof PrismaClientKnownRequestError && err.code === "P2003") {
                throw new NotFoundException("transporter", transporterId);
            }
            throw err;
        }
    }

    async getAllDriversByTransporterId(transporterId: string) {
        const drivers = await this.userRepository.getDriverByTransporter(transporterId);

        const driverIds = drivers.map(driver => driver.userId);

        const groupedRatings = await this.ratingRepository.getAvgRatingByExistDriver(driverIds);
        return drivers.map(driver => {
            const rolesOnly = driver.roles.map(role => role.roleId);
            if (!rolesOnly.includes(roleNumber.DRIVER)) return null;
            const { password, nik, rescheduleStatus, wasteFees, loyaltyId, qrCode, roles, ...restOfAttribute } = driver;

            const found = groupedRatings.find(group => group.userDriverId === driver.userId);
            const now = DayConvertion.getCurrent();
            const createdAt = DayConvertion.getTarget(driver.createdAt);
            const yearExp = DayConvertion.getDiffOfYear(now, createdAt);
            return {
                ...restOfAttribute,
                score: found?._avg.ratingScore ?? null,
                experience: {
                    yearExp,
                    monthExp: DayConvertion.getDiffOfMonth(now, createdAt, yearExp),
                }
            }
        }).filter(Boolean);
    }
}

export default DriverService;
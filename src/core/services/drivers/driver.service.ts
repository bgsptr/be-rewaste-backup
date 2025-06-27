import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { CreateDriverDto } from "src/application/dto/drivers/create_driver.dto";
import { CustomBadRequest } from "src/core/exceptions/custom-bad-request.exception";
import { CustomConflict } from "src/core/exceptions/custom-conflict.exception";
import { CustomForbidden } from "src/core/exceptions/custom-forbidden.exception";
import { NotFoundException } from "src/core/exceptions/not-found.exception";
import { LoggerService } from "src/infrastructure/logger/logger.service";
import CarRepository from "src/infrastructure/postgres/repositories/car.repository";
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
        private carRepository: CarRepository,
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

    async getAllDriversByTransporterId(
        transporterId: string,
        available?: string,
        hasAddress?: string
    ) {
        const parseBooleanQuery = (value: string | undefined, key: string): boolean | undefined => {
            if (value === undefined) return undefined;
            if (value !== "true" && value !== "false") {
                throw new CustomBadRequest(`Query parameter '${key}' must be either 'true' or 'false'`);
            }
            return value === "true";
        };

        const availableOnly = parseBooleanQuery(available, "available_only");
        const requireAddress = parseBooleanQuery(hasAddress, "has_address");

        const drivers = await this.userRepository.getDriverByTransporter(transporterId);
        const driverIds = drivers.map(d => d.userId);
        const groupedRatings = await this.ratingRepository.getAvgRatingByExistDriver(driverIds);

        const allDetailDrivers = drivers
            .map(driver => {
                const roleIds = driver.roles.map(role => role.roleId);
                if (!roleIds.includes(roleNumber.DRIVER)) return null;

                const {
                    password, nik, rescheduleStatus, wasteFees,
                    loyaltyId, qrCode, roles, ...rest
                } = driver;

                const now = DayConvertion.getCurrent();
                const createdAt = DayConvertion.getTarget(driver.createdAt);
                const yearExp = DayConvertion.getDiffOfYear(now, createdAt);
                const monthExp = DayConvertion.getDiffOfMonth(now, createdAt, yearExp);
                const rating = groupedRatings.find(r => r.userDriverId === driver.userId);

                return {
                    ...rest,
                    score: rating?._avg.ratingScore ?? null,
                    experience: { yearExp, monthExp }
                };
            })
            .filter(Boolean);

        const isAvailable = (driver: any) => driver?.car && !driver?.driverVillageId;
        const hasAddressData = (driver: any) => driver?.address !== null;

        const filteredDrivers = allDetailDrivers.filter(driver => {
            // cek per filter driver apakah sudah punya filter query pertama dan kedua, jika query pertama undefined pertama maka lanjut ke filter kedua, 
            // jika hasil akhir adalah true maka row tersebut akan masuk dan return true
            if (availableOnly !== undefined && isAvailable(driver) !== availableOnly) return false;
            if (requireAddress !== undefined && hasAddressData(driver) !== requireAddress) return false;
            return true;
        });

        return filteredDrivers;
    }


    async updateCarOfTheDriver(carId: string, driverId: string) {
        try {
            const selectedCar = await this.carRepository.get(carId);
            this.logger.debug(selectedCar);
            if (selectedCar.id === carId) throw new CustomConflict("car", carId, "car already assigned to this driver");
            // pake agar tidak ada case dimana mobil yang sudah dipakai sembarangan di-assign ke driver lain
            // if (selectedCar.driverId) throw new CustomConflict('car');
            return await this.carRepository.assignCarToDriver(carId, driverId);
        } catch (err) {
            this.logger.error(err);
            if (err instanceof PrismaClientKnownRequestError) throw new NotFoundException('car', carId);
            throw err;
        }
    }

    async getDriverDetail(driverId: string) {
        try {
            const driverData = this.userRepository.getDriverById(driverId);
            // const driverData = await this.carRepository.getDriver(driverId);

            return driverData;
        } catch (err) {
            if (err instanceof PrismaClientKnownRequestError) throw new NotFoundException('driver', driverId);
            throw err;
        }
    }
}

export default DriverService;
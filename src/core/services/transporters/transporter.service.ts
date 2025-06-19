import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { CreateCitizenDto } from "src/application/dto/citizens/create_citizen.dto";
import { CreateTransporterDto } from "src/application/dto/transporter/create_transporter.dto";
import { CitizenMapper } from "src/application/mapper/citizen.mapper";
import { TransporterMapper } from "src/application/mapper/transporter.mapper";
import { CustomConflict } from "src/core/exceptions/custom-conflict.exception";
import { CustomForbidden } from "src/core/exceptions/custom-forbidden.exception";
import { NotFoundException } from "src/core/exceptions/not-found.exception";
import { LoggerService } from "src/infrastructure/logger/logger.service";
import AddressRepository from "src/infrastructure/postgres/repositories/address.repository";
import TransporterVillageRepository from "src/infrastructure/postgres/repositories/transporter-village.repository";
import TransporterRepository from "src/infrastructure/postgres/repositories/transporter.repository";
import UserRoleRepository from "src/infrastructure/postgres/repositories/user-role.repository";
import UsersRepository from "src/infrastructure/postgres/repositories/users.repository";
import { RolesEnum } from "src/shared/constants/roles.contants";
import { roleNumber } from "src/utils/enum/role.enum";
import { generateId, RoleIdGenerate } from "src/utils/generator";
import { Hasher } from "src/utils/static/hasher";

interface VillageDriver {
    transporterId: string;
    villageId: string;
    drivers: string[]
}

@Injectable()
export class TransporterService {
    constructor(
        private transporterMapper: TransporterMapper,
        private transporterRepository: TransporterRepository,
        private transporterVillageRepository: TransporterVillageRepository,
        private userRepository: UsersRepository,
        private userRoleRepository: UserRoleRepository,
        private userMapper: CitizenMapper,
        private addressRepository: AddressRepository,
        private logger: LoggerService,
    ) { }

    async addTransporter(transporterDto: CreateTransporterDto, villageId: string | null = null) {
        const transporterEntity = this.transporterMapper.toEntity(transporterDto);
        const transporterId = await this.transporterRepository.create(transporterEntity);

        // create user
        const { phone, email, personInCharge } = transporterDto;
        const userData: CreateCitizenDto = {
            fullname: personInCharge,
            phone,
            email,
            nik: "",
            address: "",
        }
        const password = await Hasher.hashPassword("transporter123");
        const addressId = await this.addressRepository.generateAddressId(generateId());

        const userEntity = this.userMapper.toEntity(userData, villageId, password, RoleIdGenerate.transporter, addressId, transporterId);


        const userId = await this.userRepository.registerAccountFullData(userEntity);
        console.log("created account for transporter: ", userId);

        // add role
        await this.userRoleRepository.addRole(userId, roleNumber.TRANSPORTER);

        // check if payload internal transporter is false (swasta) lalu buat repository untuk model itu

        // if created by village automate assign transporter to that village
        if (villageId) await this.transporterVillageRepository.create({ transporterId, villageId });

        return transporterId;
    }

    async addServiceArea(data: VillageDriver) {
        this.logger.log("add service area");

        const { drivers, transporterId, villageId } = data;
        try {
            // boleh transaction prisma atau tidak

            const driversFromDB = await this.transporterRepository.getAllDriversOnlyId(transporterId);
            // const invalidDriverExists = drivers.some(driverId => {
            //     const match = driversFromDB.find(driverDB => driverDB.id === driverId && driverDB.villageId === null);
            //     return !match;
            // });

            const driverMap = new Map(driversFromDB.map(d => [d.id, d.villageId]));
            const invalidDriverExists = drivers.some(driverId => {
                const villageId = driverMap.get(driverId);
                return villageId !== null || villageId === undefined;
            })

            if (invalidDriverExists) throw new CustomForbidden("some drivers may not associated with this transporter or already assigned in other villages");

            this.logger.debug("all driver is part of transporter");

            await this.transporterVillageRepository.create({
                transporterId,
                villageId
            });

            this.logger.log("successfully create transporter village row");

            await this.userRepository.associateAllDriverToSelectedVillage(drivers, villageId);

            this.logger.log(`associate all drivers: ${drivers} to village with id ${villageId}`);

        } catch (err) {
            this.logger.error(err);
            // if (err instanceof PrismaClientKnownRequestError && err.code === "P2025") throw new NotFoundException("village", villageId);
            if (err instanceof PrismaClientKnownRequestError && err.code === "P2003") throw new NotFoundException("village", villageId);
            if (err instanceof PrismaClientKnownRequestError && err.code === "P2002") throw new CustomConflict("TransporterVillage");
            // if you want to add driver please add it on PUT /driver/:driverId/villages
            throw err;
        }
    }

    async updateByAddDriverInSelectedServiceArea(data: VillageDriver) {
        // await 
    }
}
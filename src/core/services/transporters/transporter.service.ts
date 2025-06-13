import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { CreateCitizenDto } from "src/application/dto/citizens/create_citizen.dto";
import { CreateTransporterDto } from "src/application/dto/transporter/create_transporter.dto";
import { CitizenMapper } from "src/application/mapper/citizen.mapper";
import { TransporterMapper } from "src/application/mapper/transporter.mapper";
import AddressRepository from "src/infrastructure/postgres/repositories/address.repository";
import TransporterVillageRepository from "src/infrastructure/postgres/repositories/transporter-village";
import TransporterRepository from "src/infrastructure/postgres/repositories/transporter.repository";
import UserRoleRepository from "src/infrastructure/postgres/repositories/user-role.repository";
import UsersRepository from "src/infrastructure/postgres/repositories/users.repository";
import { RolesEnum } from "src/shared/constants/roles.contants";
import { roleEnum } from "src/utils/enum/role.enum";
import { generateId, RoleIdGenerate } from "src/utils/generator";
import { Hasher } from "src/utils/static/hasher";

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
        await this.userRoleRepository.addRole(userId, roleEnum.TRANSPORTER);

        // check if payload internal transporter is false (swasta) lalu buat repository untuk model itu

        // if created by village automate assign transporter to that village
        if (villageId) await this.transporterVillageRepository.createData(transporterId, villageId);

        return transporterId;
    }
}
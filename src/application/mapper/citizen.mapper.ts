import { AccountStatus, RescheduleStatus, User, Village } from "@prisma/client";
import { CreateVillageDto } from "src/application/dto/villages/create_village.dto";
import { ResponseVillageDto } from "src/application/dto/villages/response_village.dto";
import { IMapper } from "src/core/interfaces/mappers/mapper";
import { CreateCitizenDto } from "../dto/citizens/create_citizen.dto";
import { ResponseCitizenDto } from "../dto/citizens/response_citizen.dto";
import { generateIdForRole, RoleIdGenerate } from "src/utils/generator";

export class VillageMapper implements IMapper<CreateCitizenDto, User, ResponseCitizenDto> {
    toEntity(dto: CreateCitizenDto, villageId: string, addressId?: string): User {
        return {
            userId: generateIdForRole(RoleIdGenerate.user),
            villageId,
            nik: dto.nik,
            phoneNumber: dto.phone,
            email: dto.email,
            createdAt: new Date(),
            fullName: dto.fullname,
            simNo: "",
            qrCode: "",
            addressId: addressId ?? null,
            password: "",
            rescheduleStatus: RescheduleStatus.active,
            accountStatus: AccountStatus.active,
            transporterId: "",
            wasteFees: "",
            loyaltyId: ""
        };
    }

    toResponse(entity: User): ResponseCitizenDto {
        return {
            fullname: "",
            nik: "",
            address: "",
            phone: "",
            status: AccountStatus.active,
            createdAt: "",
        };
    }
}

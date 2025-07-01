import { AccountStatus, RescheduleStatus, User, Village } from "@prisma/client";
import { IMapper } from "src/core/interfaces/mappers/mapper";
import { CreateCitizenDto } from "../dto/citizens/create_citizen.dto";
import { ResponseCitizenDto } from "../dto/citizens/response_citizen.dto";
import { generateIdForRole, RoleIdGenerate } from "src/utils/generator";

export class CitizenMapper implements IMapper<CreateCitizenDto, User, ResponseCitizenDto> {
    toEntity(dto: CreateCitizenDto, villageId: string | null = null, password: string, role: RoleIdGenerate = RoleIdGenerate.user, addressId: string | null = null, transporterId: string | null = null): User {
        const userId = generateIdForRole(role);
        return {
            userId: transporterId ? transporterId : userId,
            villageId,
            nik: dto.nik,
            phoneNumber: dto.phone,
            email: dto.email,
            createdAt: new Date(),
            fullName: dto.fullname,
            simNo: "",
            qrCode: "",
            addressId,
            password: password,
            rescheduleStatus: RescheduleStatus.inactive,
            accountStatus: AccountStatus.active,
            transporterId: transporterId,
            wasteFees: "",
            loyaltyId: role === RoleIdGenerate.user ? "LOY-NOVICE" : null,
            // loyaltyId: null,
            lastSeen: null,
            rescheduleStopAt: null,
            driverVillageId: null,
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

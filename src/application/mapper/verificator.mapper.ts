import { IMapper } from "src/core/interfaces/mappers/mapper";
import { CreateVerificatorDto } from "../dto/verificators/create_verificator.dto";
import { $Enums, AccountStatus, RescheduleStatus, User } from "@prisma/client";
import { ResponseVerificatorDto } from "../dto/verificators/response_verificator.dto";
import { generateIdForRole, RoleIdGenerate } from "src/utils/generator";

export class VerificatorMapper implements IMapper<CreateVerificatorDto, User, ResponseVerificatorDto> {
    toEntity(dto: CreateVerificatorDto, password: string, role: RoleIdGenerate = RoleIdGenerate.verificator, addressId: string | null = null, transporterId: string | null = null): User {
        const verificatorId = generateIdForRole(RoleIdGenerate.verificator);
        return {
            userId: verificatorId,
            villageId: dto.villageId,
            nik: dto.nik ?? "",
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
            lastSeen: null,
            rescheduleStopAt: null,
            driverVillageId: null,
        }
    }
}
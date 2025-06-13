import { AccountStatus, Transporter, Village } from "@prisma/client";
import { CreateVillageDto } from "src/application/dto/villages/create_village.dto";
import { ResponseVillageDto } from "src/application/dto/villages/response_village.dto";
import { IMapper } from "src/core/interfaces/mappers/mapper";
import { CreateTransporterDto } from "../dto/transporter/create_transporter.dto";
import { generateIdForRole, RoleIdGenerate } from "src/utils/generator";

export class TransporterMapper implements IMapper<CreateTransporterDto, Transporter, ResponseVillageDto> {
    toEntity(dto: CreateTransporterDto): Transporter {
        const { name, personInCharge, email } = dto;
        return {
            id: generateIdForRole(RoleIdGenerate.transporter),
            name,
            leaderFullname: personInCharge,
            emailTransporter: email,
            createdAt: new Date(),
            // kkT: dto.kkTotal
        };
    }

    // toResponse(entity: Village): ResponseVillageDto {
    //     return {
    //         villageId: entity.id,
    //         villageName: entity.villageName,
    //         district: entity.district,
    //         status: entity.status ,
    //         // logo: entity.villageLogo,
    //         // website: entity.villageWebsiteUrl,
    //     };
    // }
}

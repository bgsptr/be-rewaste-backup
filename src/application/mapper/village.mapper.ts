import { AccountStatus, Village } from "@prisma/client";
import { CreateVillageDto } from "src/application/dto/villages/create_village.dto";
import { ResponseVillageDto } from "src/application/dto/villages/response_village.dto";
import { IMapper } from "src/core/interfaces/mappers/mapper";

export class VillageMapper implements IMapper<CreateVillageDto, Village, ResponseVillageDto> {
    toEntity(dto: CreateVillageDto): Village {
        return {
            id: "",
            villageName: dto.villageName,
            province: dto.province,
            district: dto.district,
            regency: dto.regency,
            description: "",
            status: AccountStatus.active,
            createdAt: new Date(),
            // kkT: dto.kkTotal
        };
    }

    toResponse(entity: Village): ResponseVillageDto {
        return {
            villageId: entity.id,
            villageName: entity.villageName,
            district: entity.district,
            status: entity.status ,
            // logo: entity.villageLogo,
            // website: entity.villageWebsiteUrl,
        };
    }
}

import { IMapper } from "src/core/interfaces/mappers/mapper";
import { UpdateVillageProfileDto } from "../dto/villages/update_village_profile.dto";
import { ResponseVillageDto } from "../dto/villages/response_village.dto";
import { VillageProfile } from "@prisma/client";

class VillageProfileMapper implements IMapper<UpdateVillageProfileDto, VillageProfile, ResponseVillageDto> {
    toEntity(dto: UpdateVillageProfileDto, villageId: string): VillageProfile {
        return {
            villageId,
            street: dto.address,
            villageEmail: dto.email,
            headVillageName: dto.name,
            villageWebsiteUrl: dto.websiteUrl,
            headVillagePhone: dto.leadContact,
            officePhone: dto.phoneNumber,
            villageLogo: null
            // bi: dto.description,
        }
    }

    // toResponse(entity: { villageId: string; street: string | null; villageLogo: string | null; villageEmail: string | null; villageWebsiteUrl: string | null; officePhone: string | null; headVillagePhone: string | null; headVillageName: string | null; }): ResponseVillageDto {
        
    // }
}

export default VillageProfileMapper;
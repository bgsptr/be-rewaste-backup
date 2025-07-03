import { VillageProfile } from "@prisma/client";
import { Repository } from "src/core/base/repository";

export interface IVillageProfileRepository extends Repository<VillageProfile> {
    getById(villageId: string): Promise<VillageProfile | null>;
}
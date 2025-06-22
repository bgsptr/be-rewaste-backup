import { Village } from "@prisma/client";

export interface IVillageRepository {
    addVillage(data: Partial<Village>): Promise<string>;
    getAll(): Promise<any>;
    getVillageWithFamilyCountAndDriver(transporterId: string): Promise<any>;
    getAssignedVerificatorByVilageId(villageId: string): Promise<string | null>;
    getById(id: string): Promise<{ id: string } | null>;
}
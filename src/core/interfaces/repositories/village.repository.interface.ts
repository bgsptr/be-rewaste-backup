import { Village } from "@prisma/client";

export interface IVillageRepository {
    addVillage(data: Partial<Village>): Promise<string>;
    getAll(): Promise<any>;  
}
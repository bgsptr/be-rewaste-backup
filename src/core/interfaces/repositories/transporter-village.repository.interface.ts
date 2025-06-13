import { TransporterVillage } from "@prisma/client";
import { Repository } from "src/core/base/repository";

export interface ITransporterVillageRepository extends Repository<TransporterVillage> {
    createData(transporterId: string, villageId: string): Promise<string>;
}

export default ITransporterVillageRepository;
import { TransporterVillage } from "@prisma/client";
import { Repository } from "src/core/base/repository";

export interface ITransporterVillageRepository extends Repository<TransporterVillage> {
    // createData(data: TransporterVillage): Promise<void>;
    countByTransporterOfVillage(villageId: string): Promise<number>;
    updateStatus(status: boolean, transporterId: string, villageId: string): Promise<void>
}

export default ITransporterVillageRepository;
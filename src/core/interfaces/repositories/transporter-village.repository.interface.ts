import { TransporterVillage } from "@prisma/client";
import { Repository } from "src/core/base/repository";

export interface ITransporterVillageRepository extends Repository<TransporterVillage> {
    // createData(data: TransporterVillage): Promise<void>;
}

export default ITransporterVillageRepository;
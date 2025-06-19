import { Transporter } from "@prisma/client";
import { Repository } from "src/core/base/repository";

export interface ITransporterRepository extends Repository<Transporter> {
    create(data: Transporter): Promise<string>;
    getAllDriversOnlyId(transporterId: string): Promise<any[]>;
}

export default ITransporterRepository;
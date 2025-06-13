import { Transporter } from "@prisma/client";
import { Repository } from "src/core/base/repository";

export interface ITransporterRepository extends Repository<Transporter> {
    create(data: Transporter): Promise<string>;
}

export default ITransporterRepository;
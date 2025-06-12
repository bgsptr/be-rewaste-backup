import { Transporter } from "@prisma/client";
import { Repository } from "src/core/base/repository";

export interface ITransporterRepository extends Repository<Transporter> {
    getRoles(userId: string): Promise<String[]>;
}

export default ITransporterRepository;
import { TransporterMapper } from "src/application/mapper/transporter.mapper";

export class TransporterService {
    constructor(
        private transporterMapper: TransporterMapper
    ) {}

    async addTransporter() {
        await this.transporterMapper.toEntity();
    }
}
import { CreateTransporterDto } from "src/application/dto/transporter/create_transporter.dto";
import { TransporterMapper } from "src/application/mapper/transporter.mapper";
import TransporterVillageRepository from "src/infrastructure/postgres/repositories/transporter-village";
import TransporterRepository from "src/infrastructure/postgres/repositories/transporter.repository";

export class TransporterService {
    constructor(
        private transporterMapper: TransporterMapper,
        private transporterRepository: TransporterRepository,
        private transporterVillageRepository: TransporterVillageRepository,
    ) { }

    async addTransporter(transporterDto: CreateTransporterDto, villageId?: string | null) {
        const transporterEntity = this.transporterMapper.toEntity(transporterDto);
        const transporterId = await this.transporterRepository.create(transporterEntity);

        // check if payload selected is private transporter (swasta) lalu buat repository untuk model itu
        if (villageId) await this.transporterVillageRepository.createData(transporterId, villageId);

        return transporterId;
    }
}
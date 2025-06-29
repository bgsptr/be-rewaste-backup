import { Injectable } from "@nestjs/common";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { IAssignVerificatorDto } from "src/application/dto/verificators/create_verificator.dto";
import { CustomConflict } from "src/core/exceptions/custom-conflict.exception";
import { NotFoundException } from "src/core/exceptions/not-found.exception";
import { LoggerService } from "src/infrastructure/logger/logger.service";
import TrashRepository from "src/infrastructure/postgres/repositories/trash.repository";
import UsersRepository from "src/infrastructure/postgres/repositories/users.repository";
import VillageRepository from "src/infrastructure/postgres/repositories/village.repository";

@Injectable()
class VerificationService {
    constructor(
        private trashRepository: TrashRepository,
        private userRepository: UsersRepository,
        private villageRepository: VillageRepository,
        private logger: LoggerService,
    ) {

    }

    async updateVerificatorInformation(verificatorIdDto: string, data: IAssignVerificatorDto) {
        try {
            const verificatorId = await this.userRepository.updateVerificatorAndReturnId({ userId: verificatorIdDto, ...data });
            const village = data.villageId ? await this.villageRepository.getById(data.villageId) : null;
            // if (village && village.userVerificatorId) throw new CustomConflict('village', village.id, `selected village already have verificator`);
            if (village) {
                if (village.userVerificatorId) throw new CustomConflict('village', village.id, `selected village already have verificator`);

                await this.villageRepository.update({ id: village.id, userVerificatorId: verificatorId });
            }

            return verificatorId;
        } catch(err) {
            this.logger.error(err);
            throw err;
        }
    }

    async listAllVerification(verificatorId: string) {
        try {
            const { id } = await this.villageRepository.getByUserVerificatorId(verificatorId);
            const userInfos = await this.userRepository.findAllCitizenOnlyAddressIdInVillage(id);
            const userIds = userInfos.filter(user => user.loyaltyId !== null).map(user => user.userId);
            return this.trashRepository.getTrashByBatchCitizenId(userIds);
        } catch (err) {
            this.logger.error(err);
            if (err instanceof PrismaClientKnownRequestError) throw new NotFoundException("verificator is not assigned to any village");
            throw err;
        }
    }
}

export default VerificationService;
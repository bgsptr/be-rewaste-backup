import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PickupStatus, Trash } from "@prisma/client";
import { LoggerService } from "src/infrastructure/logger/logger.service";
import TrashRepository from "src/infrastructure/postgres/repositories/trash.repository";
import UsersRepository from "src/infrastructure/postgres/repositories/users.repository";
import { generateIdWithNano } from "src/utils/generator";

@Injectable()
class TrashService {
    constructor(
        private trashRepository: TrashRepository,
        private userRepository: UsersRepository,
        private logger: LoggerService,
    ) { }

    @Cron(CronExpression.EVERY_MINUTE)
    async generateRegularPickups() {
        this.logger.log("do cron for create trash job");
        try {
            const activeCitizens = await this.userRepository.getAllCitizenHavingAddressAndNotRescheduled();

            if (!activeCitizens.length) {
                this.logger.warn('No active citizens found for pickup generation');
                return;
            }

            const trashPickups = activeCitizens.filter(pickup => pickup.villageId && pickup.address?.addressId).map(
                pickup => {
                    return {
                        verifyStatus: false,
                        pickupStatus: PickupStatus.draft,
                        createdAt: new Date(),
                        id: `WS-${generateIdWithNano()}`,
                        userCitizenId: pickup.userId,
                        userDriverId: null,
                        pickupAt: null,
                        pickupRateTime: null,
                        point: null,
                        rescheduleNote: null,
                    } as Trash;
                }
            )

            if (!trashPickups.length) {
                this.logger.warn('Zero pickup for today');
                return;
            }

            await this.trashRepository.createTrash(trashPickups);
            this.logger.log("successfully do the cron");

        } catch (err) {
            this.logger.error('Cron job failed', err.stack);
            throw err;
        }
    }
}

export default TrashService;
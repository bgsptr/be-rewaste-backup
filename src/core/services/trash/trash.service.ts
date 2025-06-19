import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PickupStatus, Trash, TrashHasTrashType } from "@prisma/client";
import { CustomForbidden } from "src/core/exceptions/custom-forbidden.exception";
import { NotFoundException } from "src/core/exceptions/not-found.exception";
import { LoggerService } from "src/infrastructure/logger/logger.service";
import TrashTypeMapRepository from "src/infrastructure/postgres/repositories/trash-type-map.repository";
import TrashTypeRepository from "src/infrastructure/postgres/repositories/trash-type.repository";
import TrashRepository from "src/infrastructure/postgres/repositories/trash.repository";
import UsersRepository from "src/infrastructure/postgres/repositories/users.repository";
import { generateIdWithNano } from "src/utils/generator";

@Injectable()
class TrashService {
    constructor(
        private trashRepository: TrashRepository,
        private userRepository: UsersRepository,
        private logger: LoggerService,
        private trashTypeMap: TrashTypeMapRepository,
        private trashType: TrashTypeRepository,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async generateRegularPickups() {
        this.logger.log("do cron for create trash job");
        try {
            const activeCitizens = await this.userRepository.getAllCitizenHavingAddressAndNotRescheduled();

            if (!activeCitizens.length) {
                this.logger.warn('No active citizens found for pickup generation');
                return;
            }

            // const generatedTrashId = `WS-${generateIdWithNano()}`;

            const trashPickups = activeCitizens.filter(pickup => pickup.villageId && pickup.address?.addressId).map(
                pickup => {
                    const generatedTrashId = `WS-${generateIdWithNano()}`;
                    return {
                        verifyStatus: false,
                        pickupStatus: PickupStatus.draft,
                        createdAt: new Date(),
                        id: generatedTrashId,
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

            const typeIds = await this.trashType.getAllTrashTypeIds();

            const data: TrashHasTrashType[] = typeIds.map(type => {
                const generatedTrashId = `WS-${generateIdWithNano()}`;
                return {
                    trashId: generatedTrashId,
                    trashTypeId: type.id,
                    weight: 0,
                    verificationStatus: false,
                    imageUrl: "",
                }
            });

            await this.trashTypeMap.generateTrashMapAllTypeCron(data);
            this.logger.log("successfully do the cron");

        } catch (err) {
            this.logger.error('Cron job failed', err.stack);
            throw err;
        }
    }

    async getTrashHistories(userId: string) {
        return await this.trashRepository.getAllWithTypes(userId);
    }

    async getTrashById(trashId: string, userId: string) {
        try {
            this.logger.debug("check trash from userId: ", userId);
            await this.trashRepository.getTrashOwner(trashId);

            const { userDriver, verification, trashTypes, ...rest } = await this.trashRepository.getWithTypesById(trashId);

            // ganti relasi one user (verificator) to one trash entity

            const verificator = verification.length && await this.userRepository.getVerificatorDataById(verification[0].verificatorUserId);
            this.logger.debug(verificator);


            const data = {
                ...rest,
                driver: {
                    id: userDriver?.userId,
                    name: userDriver?.fullName,
                },
                verificator: verificator ? {
                    id: verificator?.userId,
                    name: verificator?.fullName,
                    verifyAt: verification[0].createdAt ?? null,
                } : {},
                weightTotal: trashTypes.reduce((total, tType) => total + tType.weight, 0),
                trashTypes: trashTypes.map(type => ({
                    weight: type.weight,
                    trashTypeId: type.trashTypeId,
                    name: type.trashType.name,
                    imageUrl: type.imageUrl,
                })),
            }

            this.logger.debug(data);

            return data;

        } catch (err) {
            this.logger.error(err);
            throw new CustomForbidden();
        }
    }

    async getDailyTrashInformation(userId: string) {
        this.logger.log("get daily trash service");
        try {
            const data = await this.trashRepository.getLatestTrashOfTheOwner(userId);

            return data;
        } catch (err) {
            this.logger.log("if not found should return not found exception");
            this.logger.error(err);
            throw new NotFoundException("trash");
        }
    }
}

export default TrashService;
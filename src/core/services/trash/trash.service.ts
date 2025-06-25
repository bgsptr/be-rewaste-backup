import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PickupStatus, Trash, TrashHasTrashType, Verification } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { CustomBadRequest } from "src/core/exceptions/custom-bad-request.exception";
import { CustomForbidden } from "src/core/exceptions/custom-forbidden.exception";
import { NotFoundException } from "src/core/exceptions/not-found.exception";
import { LoggerService } from "src/infrastructure/logger/logger.service";
import TrashTypeMapRepository from "src/infrastructure/postgres/repositories/trash-type-map.repository";
import TrashTypeRepository from "src/infrastructure/postgres/repositories/trash-type.repository";
import TrashRepository from "src/infrastructure/postgres/repositories/trash.repository";
import UsersRepository from "src/infrastructure/postgres/repositories/users.repository";
import VillageRepository from "src/infrastructure/postgres/repositories/village.repository";
import { generateId, generateIdWithNano } from "src/utils/generator";

@Injectable()
class TrashService {
    constructor(
        private trashRepository: TrashRepository,
        private userRepository: UsersRepository,
        private villageRepository: VillageRepository,
        private logger: LoggerService,
        private trashTypeMap: TrashTypeMapRepository,
        private trashType: TrashTypeRepository,
    ) { }

    // @Cron(CronExpression.EVERY_MINUTE)
    @Cron(CronExpression.EVERY_10_HOURS)
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
            throw new NotFoundException("trash for today");
        }
    }

    async updateTrashStatusToNeedVerify(trashId: string, driverId: string) {
        try {
            const { id, pickupStatus, userDriver, userCitizen } = await this.trashRepository.getWithTypesById(trashId);
            if (pickupStatus !== PickupStatus.scheduled) throw new CustomBadRequest(`failed to pickup, due the trash is not scheduled to any driver`);
            if (userDriver && userDriver.userId !== driverId) throw new CustomForbidden(`cannot access anyone pickups`);

            await this.trashRepository.updatePickupStatusById(trashId, PickupStatus.in_progress);

            if (!userCitizen.villageId) throw new NotFoundException("trash associated with village");
            const verificatorUserId = await this.villageRepository.getAssignedVerificatorByVilageId(userCitizen.villageId);
            if (!verificatorUserId) throw new NotFoundException("verificator");

            const data: Verification = {
                verificatorUserId,
                createdAt: new Date().toISOString(),
                id: `VRF-${generateId()}`,
                trashId: id,
                verifyRateTime: 0,
                status: false
            }
        } catch (err) {
            this.logger.error(err);
            if (err instanceof PrismaClientKnownRequestError && err.code === "P2025") throw new NotFoundException("trash", trashId);
            throw err;
        }
    }

    async updateStatusToSchedule(trashId: string) {
        try {
            const { id, pickupStatus } = await this.trashRepository.getWithTypesById(trashId);
            if (pickupStatus !== PickupStatus.draft) throw new CustomBadRequest(`failed to pickup, due the trash is not in draft status`);
            await this.trashRepository.updatePickupStatusById(id, PickupStatus.scheduled);
        } catch (err) {
            this.logger.error(err);
            if (err instanceof PrismaClientKnownRequestError && err.code === "P2025") throw new NotFoundException("trash", trashId);
            throw err;
        }
    }
}

export default TrashService;
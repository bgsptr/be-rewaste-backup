import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { JoinStatus, PickupStatus, Trash, TrashHasTrashType, Verification } from "@prisma/client";
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
import { OpenRouteAPIService } from "../openrouteservice/open-route-api.service";
import { CustomConflict } from "src/core/exceptions/custom-conflict.exception";
import DayConvertion from "src/utils/static/dayjs";

@Injectable()
class TrashService {
    constructor(
        private trashRepository: TrashRepository,
        private userRepository: UsersRepository,
        private villageRepository: VillageRepository,
        private logger: LoggerService,
        private trashTypeMap: TrashTypeMapRepository,
        private trashType: TrashTypeRepository,
        private ors: OpenRouteAPIService,
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
                        pickupStatus: PickupStatus.generated,
                        createdAt: new Date(),
                        id: generatedTrashId,
                        userCitizenId: pickup.userId,
                        userDriverId: null,
                        actualPickupAt: null,
                        pickupRateTime: null,
                        estimatePickupAt: null,
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

            // bug => trash type part akan digenerate ketika trash sudah diverifikasi oleh verificator
            // const typeIds = await this.trashType.getAllTrashTypeIds();

            // const data: TrashHasTrashType[] = typeIds.map(type => {
            //     const generatedTrashId = `WS-${generateIdWithNano()}`;
            //     return {
            //         trashId: generatedTrashId,
            //         trashTypeId: type.id,
            //         weight: 0,
            //         verificationStatus: false,
            //         imageUrl: "",
            //     }
            // });

            // await this.trashTypeMap.generateTrashMapAllTypeCron(data);
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

            // coba debug
            const verificator = verification?.verificatorUserId && await this.userRepository.getVerificatorDataById(verification.verificatorUserId);
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
                    verifyAt: verification?.createdAt ?? null,
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
            if (err instanceof PrismaClientKnownRequestError) throw new CustomForbidden();
            throw err;
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
            if (pickupStatus !== PickupStatus.assigned) throw new CustomBadRequest(`failed to pickup, due the trash is not scheduled to any driver`);
            if (userDriver && userDriver.userId !== driverId) throw new CustomForbidden(`cannot access anyone pickups`);

            await this.trashRepository.updatePickupStatusById(trashId, PickupStatus.verifying);

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

    async updateStatusToSchedule(trashId: string, driverId: string) {
        try {

            // verifikasi jika ada sampah terakhir yg diangkut gunakan titik itu, jika pertama kali ambil titik alamat driver
            const lastTrashPickup = await this.trashRepository.getAssignedLastForTodayWithDriverId(driverId);
            const driver = await this.userRepository.getDriverById(driverId);
            const { id, pickupStatus, userCitizen, userDriver } = await this.trashRepository.getWithTypesById(trashId);
            if (userDriver) throw new CustomConflict('trash', '', 'trash already assigned');
            // karena verifikasi dulu kalo user ada loyalty id baru driver bisa pickup
            // if (pickupStatus !== PickupStatus.generated) throw new CustomBadRequest(`failed to pickup, due the trash is not in draft status`);
            if (!userCitizen.address || !driver.address) throw new CustomBadRequest("either citizen or driver did not add the address before");
            const { lat: citizenLat, lng: citizenLng } = userCitizen.address;
            const { lat: driverLat, lng: driverLng } = driver.address;
            const startLocation = lastTrashPickup ? {
                lat: lastTrashPickup.userCitizen.address && lastTrashPickup.userCitizen.address.lat || '',
                lng: lastTrashPickup.userCitizen.address && lastTrashPickup.userCitizen.address.lng || '',
            } : {
                lat: driverLat,
                lng: driverLng,
            }

            if (!startLocation.lat || !startLocation.lng) throw new CustomBadRequest('')
            const result = await this.ors.calculateTwoPinpointWithDistanceAPI(startLocation, { lat: citizenLat, lng: citizenLng });
            // const { distance, duration } = result.routes.summary; //POST
            const { distance, duration } = result.features[0].properties.segments[0];
            const estimatePickupAt = DayConvertion.getCurrent().add(duration, 'second').toDate();
            await this.trashRepository.updateTrashDetailById(driverId, trashId, distance, duration, estimatePickupAt);
            // karena verifikasi dulu kalo user ada loyalty id baru driver bisa pickup
            // await this.trashRepository.updatePickupStatusById(id, PickupStatus.assigned);
        } catch (err) {
            this.logger.error(err);
            if (err instanceof PrismaClientKnownRequestError && err.code === "P2025") throw new NotFoundException("trash", trashId);
            throw err;
        }
    }

    async getDailyPickupList(userId: string) {

        // const villageId = await this.userRepository.getAssignedVillageId(userId);
        // if (!villageId) throw new NotFoundException("trash");

        const user = await this.userRepository.getSelfInformation(userId);
        if (!user?.driverVillageId || !user.transporterId) throw new NotFoundException("transporter");
        const { driverVillageId, transporterId } = user;

        // refactor dan masukkan di VillageService agar bisa digunakan oleh UserService untuk get trash with status draft
        const linked = await this.villageRepository.getLinkedProposal(transporterId, driverVillageId);
        this.logger.debug(linked);

        if (linked?.transporterVillage.find(village => village.villageId === user.driverVillageId)?.joinStatus !== JoinStatus.Accepted) throw new NotFoundException("trash");
        const trashList = await this.trashRepository.getTrashTodayFromSelectedVillage(linked.transporterVillage[0].villageId);

        // return trashList;

        // di frontend => warna merah kalo loyaltyId is not null dan verify status false,
        // warna kuning => loyaltyId is null atau loyalty id not null dan veriy status true,
        // warna hijau => sudah di scan pickup
        this.logger.debug(trashList);

        const listThatNeedVerify = trashList.filter(list => list.userCitizen.loyaltyId && !list.verifyStatus).map(item => ({
            pickupIsFinished: "need_verify",
            ...item,
        }));
        const needVerityTrashIds = new Set(listThatNeedVerify.map(item => item.id));
        const unloyaltyTrash = trashList.filter(item => !needVerityTrashIds.has(item.id)).map(item => ({
            pickupIsFinished: item.pickupStatus === PickupStatus.completed ? "pickup_complete" : "ready_to_pickup",
            ...item,
        }));

        return [...listThatNeedVerify, ...unloyaltyTrash];
    }
}

export default TrashService;
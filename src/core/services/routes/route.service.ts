import { PickupStatus } from "@prisma/client";
import { LoggerService } from "src/infrastructure/logger/logger.service";
import TransporterVillageRepository from "src/infrastructure/postgres/repositories/transporter-village.repository";
import TrashRepository from "src/infrastructure/postgres/repositories/trash.repository";
import UsersRepository from "src/infrastructure/postgres/repositories/users.repository";
import { Job, OpenRouteAPIService, Vehicle } from "../openrouteservice/open-route-api.service";
import { NotFoundException } from "src/core/exceptions/not-found.exception";
import { Injectable } from "@nestjs/common";
import VillageRepository from "src/infrastructure/postgres/repositories/village.repository";
import { CustomBadRequest } from "src/core/exceptions/custom-bad-request.exception";

@Injectable()
class RouteService {
    constructor(
        private userRepository: UsersRepository,
        private trashRepository: TrashRepository,
        private villageRepository: VillageRepository,
        private transporterVillageRepository: TransporterVillageRepository,
        private logger: LoggerService,
        private ors: OpenRouteAPIService,
    ) { }

    async addRouteToSelectedVillage(villageId: string, transporterId: string) {
        try {

            // buat mapping karena id di request body optimization job id dan vehicle id tidak boleh berupa string
            type EntityType = 'driver' | 'trash';
            const idMap = new Map<number, { type: EntityType, originalId: string }>();
            let currentId = 1;

            // const results = await this.userRepository.findAllCitizenOnlyAddressIdInVillage(villageId);

            // validasi villageId??
            if (villageId.length === 0) throw new CustomBadRequest("need to insert the id of the village");

            const village = await this.villageRepository.getById(villageId);

            if (!village) throw new NotFoundException("village");

            const allTrashToday = await this.trashRepository.getTrashTodayFromSelectedVillage(villageId);

            // count where in id user driver id
            const maxResultsOfCitizen = allTrashToday.length;

            // const transporterIds = allTrashToday.filter(result => {
            //     if (result.pickupStatus === PickupStatus.scheduled) {
            //         return result.userDriver?.transporterId; // ["transporter id pertama", "kedua"]
            //     }
            // });

            const draftTrash = allTrashToday.filter(t => t.pickupStatus === PickupStatus.draft);
            const scheduledTrash = allTrashToday.filter(t => t.pickupStatus === PickupStatus.scheduled);

            const scheduledTransporterIds = scheduledTrash
                .map(t => t.userDriver?.transporterId)
                .filter(Boolean);

            this.logger.log(scheduledTransporterIds);

            const transporterCount = await this.transporterVillageRepository.countByTransporterOfVillage(villageId);
            if (transporterCount === 0) {
                throw new NotFoundException('any transporter');
            }
            // citizen bagi transporter
            // const capacityTotalInTransporter = maxResultsOfCitizen / transporterCount - scheduledTransporterIds.length;

            // const lengthOfDriver = drivers.length;

            // const capacityFinal = capacityTotalInTransporter / lengthOfDriver;

            const scheduledCountForThisTransporter = scheduledTrash.filter(
                t => t.userDriver?.transporterId === transporterId
            ).length;

            const quotaForThisTransporter = Math.max(
                draftTrash.length / transporterCount - scheduledCountForThisTransporter,
                0
            );

            // capacity nanti dibagi lagi dengan jumlah driver yang ada di transporter
            const drivers = await this.userRepository.getDriverByTransporter(transporterId);
            this.logger.debug(drivers);
            if (drivers.length === 0) {
                throw new NotFoundException('No drivers found for this transporter');
            }

            const capacityPerDriver = Math.floor(quotaForThisTransporter / drivers.length);


            const jobs: Job[] = allTrashToday
                .filter(trash => trash.pickupStatus === PickupStatus.draft)
                .map(trash => {
                    idMap.set(currentId, { type: 'trash', originalId: trash.id });

                    const job: Job = {
                        id: currentId,
                        location: [
                            Number(trash.userCitizen.address?.lng ?? "0"),
                            Number(trash.userCitizen.address?.lat ?? "0"),
                        ],
                        delivery: [1],
                    };

                    currentId++;

                    return job;
                });

            const vehicles: Vehicle[] = drivers.map(driver => {
                idMap.set(currentId, { type: 'driver', originalId: driver.userId });

                return {
                    id: currentId++,
                    start: [Number(driver.address?.lng ?? 0), Number(driver.address?.lat ?? 0)],
                    end: [Number(driver.address?.lng ?? 0), Number(driver.address?.lat ?? 0)],
                    capacity: [capacityPerDriver],
                    profile: 'driving-car',
                };
            });

            const optimizedResult = await this.ors.optimized({
                jobs,
                vehicles,
            });

            this.logger.log(optimizedResult);

            const trashToUpdate: { id: string; driverId: string }[] = [];

            this.logger.debug(idMap);

            for (const route of optimizedResult.routes) {
                const driverId = idMap.get(route.vehicle);

                if (!driverId?.originalId) continue;

                for (const step of route.steps) {
                    if (step.type === 'job' && step.job != null) {
                        const trashInfo = idMap.get(step.job);
                        if (trashInfo?.type !== 'trash') continue;
                        const trashId = trashInfo.originalId;

                        trashToUpdate.push({
                            id: trashId,
                            driverId: driverId.originalId,
                        });
                    }
                }
            }

            // Jalankan update bulk sekali pakai WHERE id IN (...)
            // const idsToUpdate = trashToUpdate.map(t => t.id);

            await this.trashRepository.bulkUpdateStatusAndDriver(trashToUpdate);
        } catch (err) {
            this.logger.error(err);
            if (err.code === "400") throw new CustomBadRequest("there is an error in optimized ORS API");
            throw err;
        }
    }
}

export default RouteService;
import { PickupStatus } from "@prisma/client";
import axios from "axios";
import { LoggerService } from "src/infrastructure/logger/logger.service";
import TransporterVillageRepository from "src/infrastructure/postgres/repositories/transporter-village.repository";
import TrashRepository from "src/infrastructure/postgres/repositories/trash.repository";
import UsersRepository from "src/infrastructure/postgres/repositories/users.repository";
import { Job, OpenRouteAPIService, OptimizationRequest, Vehicle } from "../openrouteservice/open-route-api.service";
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
        if (drivers.length === 0) {
            throw new NotFoundException('No drivers found for this transporter');
        }

        const capacityPerDriver = Math.floor(quotaForThisTransporter / drivers.length);


        const jobs: Job[] = allTrashToday
            .filter(result => result.pickupStatus === PickupStatus.draft)
            .map(result => ({
                id: Number(result.id),
                location: [
                    Number(result.userCitizen.address?.lng ?? "0"),
                    Number(result.userCitizen.address?.lat ?? "0"),
                ],
                delivery: [1],
            }));

        const vehicles: Vehicle[] = drivers.map(driver => ({
            id: Number(driver.userId),
            start: [
                Number(driver.address?.lng ?? 0),
                Number(driver.address?.lat ?? 0),
            ],
            end: [
                Number(driver.address?.lng ?? 0),
                Number(driver.address?.lat ?? 0),
            ],
            capacity: [capacityPerDriver],
            profile: 'driving-car',
        }));

        const optimizedResult = await this.ors.optimized({
            jobs,
            vehicles,
        });

        this.logger.log(optimizedResult);

        const trashToUpdate: { id: string; driverId: string }[] = [];

        for (const route of optimizedResult.routes) {
            const driverId = route.vehicle;

            for (const step of route.steps) {
                if (step.type === 'job' && step.job != null) {
                    trashToUpdate.push({
                        id: step.job,
                        driverId: driverId,
                    });
                }
            }
        }

        // Jalankan update bulk sekali pakai WHERE id IN (...)
        // const idsToUpdate = trashToUpdate.map(t => t.id);

        await this.trashRepository.bulkUpdateStatusAndDriver(trashToUpdate);
    }
}

export default RouteService;
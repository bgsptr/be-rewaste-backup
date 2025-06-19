import { Car } from "@prisma/client";
import { Repository } from "src/core/base/repository";

export interface ICarRepository extends Repository<Car> {
    getAllWithDriver(): Promise<any>;
    getFleetData(driverId: string): Promise<any>;
    // addMaintenance(): Promise<void>;
    // addBBM(): Promise<void>;
    // getCarInformationById(carId: string): Promise<any>;
}
import { DriverRating } from "@prisma/client";
import { Repository } from "src/core/base/repository";

export interface IRatingRepository extends Repository<DriverRating> {
    getAvgRatingByExistDriver(driverIds: string[]): Promise<any>;
}

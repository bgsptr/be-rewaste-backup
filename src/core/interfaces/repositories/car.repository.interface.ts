import { Car } from "@prisma/client";
import { Repository } from "src/core/base/repository";

export interface ICarRepository extends Repository<Car> {
    getAllWithDriver(): Promise<any>;
}
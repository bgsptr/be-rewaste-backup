import { Loyalty, Point } from "@prisma/client";
import { Repository } from "src/core/base/repository";

export interface IPointRepository extends Repository<Point> {
    getPointOverview(userId: string): Promise<any>;
}
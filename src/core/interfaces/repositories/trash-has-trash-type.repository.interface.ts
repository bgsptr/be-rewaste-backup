import { TrashHasTrashType, UserRoles } from "@prisma/client";
import { Repository } from "src/core/base/repository";

export interface ITrashPartRepository extends Repository<TrashHasTrashType> {
    addOnePacket(data: TrashHasTrashType[]): Promise<void>;
}
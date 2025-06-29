import { Verification } from "@prisma/client";
import { Repository } from "src/core/base/repository";

export interface IVerificationRepository extends Repository<Verification> {
    getAllTrashIdByVerificatorId(id: string): Promise<string[]>;
    getVerificationHistoryList(verificatorId: string): Promise<any>;
    getById(verificationId: string): Promise<Verification>;
}
import { User } from "@prisma/client";
import { Repository } from "src/core/base/repository";

export interface IUserRepository extends Repository<User> {
    registerAccountFullData(data: User): Promise<string>;
    registerAccount(data: Partial<User>): Promise<string>;
    // registerCitizen(data: Partial<User>): Promise<string>;
    getCitizens(): Promise<any | User[]>;
    updateLastSeen(userId: string, date: Date): Promise<void>;
}
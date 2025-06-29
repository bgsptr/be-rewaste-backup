import { Address, User } from "@prisma/client";
import { Repository } from "src/core/base/repository";

export interface IUserRepository extends Repository<User> {
    getCitizenDetailByCitizenId(userId: string): Promise<any>;
    registerAccountFullData(data: User): Promise<string>;
    registerAccount(data: Partial<User>, password?: string): Promise<string>;
    // registerCitizen(data: Partial<User>): Promise<string>;
    getCitizens(): Promise<any | User[]>;
    updateLastSeen(userId: string, date: Date): Promise<void>;
    getAllCitizenHavingAddressAndNotRescheduled(): Promise<any>;
    updateAddNewAddress(addressId: string, userId: string): Promise<any>;
    checkAddressIsExist(addressId: string): Promise<{ addressId: string | null } | null>;
    getVerificatorDataById(verificatorId: string): Promise<User | null>;
    associateAllDriverToSelectedVillage(drivers: string[], driverVillageId: string): Promise<void>;
    getActiveCitizensWithTodayDraftTrash(villageId: string): Promise<any>;
    getSelfInformation(userId: string): Promise<User | null>;
    findAllCitizenOnlyAddressIdInVillage(villageId: string): Promise<{ addresses: Address, userId: string, loyaltyId: string | null }[]>;
    getDriverById(driverId: string): Promise<any>;
    updateVerificatorAndReturnId(data: Partial<User>): Promise<string>
}
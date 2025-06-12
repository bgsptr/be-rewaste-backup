import { UserRoles } from "@prisma/client";
import { Repository } from "src/core/base/repository";

export interface IUserRoleRepository extends Repository<UserRoles> {
    fetchAll(): Promise<UserRoles>;
    addRole(userId: string, roleId: string): void;
}
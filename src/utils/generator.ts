import { v4 as uuidv4 } from "uuid"

export enum RoleIdGenerate {
    user = "USR",
    verificator = "VRV",
    driver = "DRV",
    transporter = "TSP",
    village = "VIL",
    admin = "ADM",

}

export const generateIdForRole = (role: RoleIdGenerate): string => {
    return `${role}-${uuidv4()}`;
}

export const generateId = (): string => {
    return uuidv4();
}
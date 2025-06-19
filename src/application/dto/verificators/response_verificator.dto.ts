import { AccountStatus } from "@prisma/client";

export interface ResponseVerificatorDto {
    fullname: string;
    nik: string;
    address: string;
    phone: string;
    status: AccountStatus;
    createdAt: string;
}
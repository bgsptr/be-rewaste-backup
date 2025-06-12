// export enum Status {
//   ACTIVE,
//   INACTIVE,
//   PENDING
// }

import { AccountStatus } from "@prisma/client";

export class ResponseCitizenDto {
    fullname: string;
    nik: string;
    address: string;
    phone: string;
    status: AccountStatus;
    createdAt: string;
}
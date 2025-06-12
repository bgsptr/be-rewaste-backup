import { AccountStatus } from "@prisma/client";

// export enum Status {
//   ACTIVE,
//   INACTIVE,
//   PENDING
// }

export interface ResponseVillageDto {
  villageId: string;
  villageName: string;
  district: string;
  status: AccountStatus
  total_transporter?: number;
  kkTotal?: string;
}
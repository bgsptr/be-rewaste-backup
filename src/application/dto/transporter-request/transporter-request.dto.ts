import { JoinStatus } from "@prisma/client";
import { z } from "zod";

export const assignTransporterRequestSchema = z.object({
    status: z.enum([JoinStatus.Accepted, JoinStatus.Rejected]),
});

export type AssignTransporterRequestDto = z.infer<typeof assignTransporterRequestSchema>;

export interface IAssignTransporterRequest extends z.infer<typeof assignTransporterRequestSchema> { }
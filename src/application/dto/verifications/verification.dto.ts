import { JoinStatus } from "@prisma/client";
import { z } from "zod";

export const assignVerificationSchema = z.object({
    organicWeight: z.number(),
    anorganicWeight: z.number(),
    residuWeight: z.number(),
    verificationNote: z.string().optional(),
    // verificationNote: z.string(),
});

export type AssignVerificationDto = z.infer<typeof assignVerificationSchema>;

export interface IAssignVerification extends z.infer<typeof assignVerificationSchema> { }
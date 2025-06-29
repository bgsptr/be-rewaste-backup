import { z } from "zod";

export interface CreateVerificatorDto {
    fullname: string;
    address: string;
    phone: string;
    email: string;
    villageId: string | null;
    nik?: string;
}

export const assignVerificatorDto = z.object({
    fullname: z.string(),
    address: z.string(),
    phone: z.string(),
    email: z.string(),
    villageId: z.string().optional(),
    nik: z.string().optional(),
});

export type AssignVerificatorDto = z.infer<typeof assignVerificatorDto>;
export interface IAssignVerificatorDto extends z.infer<typeof assignVerificatorDto> { }
export interface CarDto {
    model: string;
    year: number;
    capacity: number;
    plat_no: string;
    driverId?: string;
}

import { z } from "zod";

export const assignCarSchema = z.object({
    model: z.string(),
    year: z.number().min(2000, { message: 'Year must be at least 2000' }).max(2100, { message: 'Year must be at least 2100' }),
    capacity: z.number(),
    plat_no: z.string(),
    driverId: z.string().optional(),
})

export type AssignCarDto = z.infer<typeof assignCarSchema>;

export interface IAssignCarDto extends z.infer<typeof assignCarSchema> { }
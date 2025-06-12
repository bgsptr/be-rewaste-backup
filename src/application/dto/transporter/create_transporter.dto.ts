export interface CreateTransporterDto {
    name: string;
    personInCharge: string;
    phone: string;
    email: string;
    internal: boolean;
    documentUrl?: string;
}
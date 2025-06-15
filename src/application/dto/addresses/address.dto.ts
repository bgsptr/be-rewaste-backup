export interface CreateAddressDto {
    fullAddress: string;
    lat: string;
    lng: string;
}

export interface UpdateAddressDto {
    fullAddress?: string;
    lat?: string;
    lng?: string;
}
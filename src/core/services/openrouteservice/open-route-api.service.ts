// my-api.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';


export interface Location {
    /** Longitude, Latitude */
    [index: number]: number;
}

export interface Job {
    id: number;
    location: Location;
    delivery: number[];
}

export interface Vehicle {
    id: number;
    start: Location;
    end: Location;
    capacity: number[];
    profile: string; // bisa dikunci jadi 'driving-car' | 'cycling' | dst. jika perlu
}

export interface OptimizationRequest {
    jobs: Job[];
    vehicles: Vehicle[];
}

@Injectable()
export class OpenRouteAPIService {
    constructor(private readonly httpService: HttpService) { }

    async optimized(data: OptimizationRequest): Promise<any> {
        const response = await firstValueFrom(
            this.httpService.post('https://api.openrouteservice.org/optimization', data, {
                headers: {
                    Authorization: process.env.ORS_API_KEY,
                }
            })
        );
        return response.data;
    }
}

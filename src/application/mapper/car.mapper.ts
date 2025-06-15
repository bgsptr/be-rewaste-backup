import { $Enums, Car, CarStatus } from "@prisma/client";
import { IMapper } from "src/core/interfaces/mappers/mapper";
import { CarDto } from "../dto/cars/car.dto";
import { ResponseCarDto } from "../dto/cars/response_car.dto";
import { generateId, generateIdForRole, RoleIdGenerate } from "src/utils/generator";

export class CarMapper implements IMapper<CarDto, Car, ResponseCarDto> {
    toEntity(dto: CarDto, transporterId: string): Car {
        return {
            id: `TR-${generateId()}`,
            carStatus: CarStatus.idle,
            year: dto.year,
            merk: dto.model,
            capacity: dto.capacity,
            platNo: dto.plat_no,
            // apply empty string if admin add car
            transporterId,
            driverId: dto.driverId ?? null,
        }
    }
}
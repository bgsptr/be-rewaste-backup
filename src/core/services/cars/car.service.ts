import { Injectable } from "@nestjs/common";
import { CarStatus } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { IAssignCarDto } from "src/application/dto/cars/car.dto";
import { CarMapper } from "src/application/mapper/car.mapper";
import { CustomBadRequest } from "src/core/exceptions/custom-bad-request.exception";
import { CustomConflict } from "src/core/exceptions/custom-conflict.exception";
import { NotFoundException } from "src/core/exceptions/not-found.exception";
import { LoggerService } from "src/infrastructure/logger/logger.service";
import CarRepository from "src/infrastructure/postgres/repositories/car.repository";

@Injectable()
class CarService {
    constructor(
        private carRepository: CarRepository,
        private carMapper: CarMapper,
        private logger: LoggerService,
    ) { }

    async createCar(data: IAssignCarDto, transporterId: string) {
        try {
            const carIsExist = await this.carRepository.findByPlatNo(data.plat_no);
            this.logger.debug(carIsExist);
            if (carIsExist) throw new CustomConflict('car');
            const car = this.carMapper.toEntity(data, transporterId);
            const carId = await this.carRepository.create(car);

            return carId;
        } catch (err) {
            this.logger.error(err);
            if (err instanceof PrismaClientKnownRequestError) throw new CustomConflict('car');
            throw err;
        }
    }

    async getCarWithDriver(carStatus?: string) {
        const cars = await this.carRepository.getAllWithDriver();
        if (!carStatus) return cars;
        return cars.filter(car => car.carStatus === carStatus);
    }

    async getFleetInformationWithDriverId(driverId: string) {
        const data = await this.carRepository.getFleetData(driverId);
        return data;
    }

    async getCarInformation(carId: string) {
        try {
            const car = await this.carRepository.get(carId);

            if (car.carStatus !== CarStatus.idle) throw new CustomBadRequest("selected car is not in idle status");

            return car;
        } catch (err) {
            this.logger.error(err);
            if (err instanceof PrismaClientKnownRequestError) throw new NotFoundException('car', carId);
            throw err;
        }
    }
}

export default CarService;
import { Injectable } from "@nestjs/common";
import { CarDto } from "src/application/dto/cars/car.dto";
import { CarMapper } from "src/application/mapper/car.mapper";
import CarRepository from "src/infrastructure/postgres/repositories/car.repository";

@Injectable()
class CarService {
    constructor(
        private carRepository: CarRepository,
        private carMapper: CarMapper,
    ) {}

    async createCar(data: CarDto, transporterId: string) {
        const car = this.carMapper.toEntity(data, transporterId);
        const carId = await this.carRepository.create(car);

        return carId;
    }

    async getCarWithDriver() {
        const cars = await this.carRepository.getAllWithDriver();

        return cars;
    }

    async selectCarInformationById() {
        
    }
}

export default CarService;
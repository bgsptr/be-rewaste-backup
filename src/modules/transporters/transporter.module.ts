import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import TransporterController from './transporter.controller';
import { TransporterService } from 'src/core/services/transporters/transporter.service';
import { LoggerModule } from 'src/infrastructure/logger/logger.module';
import { TransporterMapper } from 'src/application/mapper/transporter.mapper';
import TransporterRepository from 'src/infrastructure/postgres/repositories/transporter.repository';
import TransporterVillageRepository from 'src/infrastructure/postgres/repositories/transporter-village.repository';
import UsersRepository from 'src/infrastructure/postgres/repositories/users.repository';
import { CitizenMapper } from 'src/application/mapper/citizen.mapper';
import UserRoleRepository from 'src/infrastructure/postgres/repositories/user-role.repository';
import AddressRepository from 'src/infrastructure/postgres/repositories/address.repository';
import DriverService from 'src/core/services/drivers/driver.service';
import { RatingModule } from '../rating/rating.module';
import { CarModule } from '../cars/car.module';
import CarService from 'src/core/services/cars/car.service';
import { AuthMiddleware } from 'src/middlewares/auth.middleware';
import VillageService from 'src/core/services/villages/village.service';
import VillageRepository from 'src/infrastructure/postgres/repositories/village.repository';
import { VillageMapper } from 'src/application/mapper/village.mapper';
import VillageProfileRepository from 'src/infrastructure/postgres/repositories/village-profile.repository';
import VillageProfileMapper from 'src/application/mapper/village-profile.mapper';

@Module({
  imports: [LoggerModule, RatingModule, CarModule],
  providers: [
    TransporterService,
    TransporterMapper,
    TransporterRepository,
    TransporterVillageRepository,
    UsersRepository,
    UserRoleRepository,
    CitizenMapper,
    AddressRepository,
    DriverService,
    CarService,
    VillageService,
    VillageRepository,
    VillageMapper,
    VillageProfileRepository,
    VillageProfileMapper,
  ],
  controllers: [TransporterController],
})
export class TransporterModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('transporters');
  }
}

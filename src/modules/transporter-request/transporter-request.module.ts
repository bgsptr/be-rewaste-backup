import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import TransporterRequestController from './transporter-request.controller';
import VillageService from 'src/core/services/villages/village.service';
import VillageRepository from 'src/infrastructure/postgres/repositories/village.repository';
import { AuthMiddleware } from 'src/middlewares/auth.middleware';
import UserRoleRepository from 'src/infrastructure/postgres/repositories/user-role.repository';
import UsersRepository from 'src/infrastructure/postgres/repositories/users.repository';
import { VillageMapper } from 'src/application/mapper/village.mapper';
import TransporterVillageRepository from 'src/infrastructure/postgres/repositories/transporter-village.repository';
import VillageProfileRepository from 'src/infrastructure/postgres/repositories/village-profile.repository';
import VillageProfileMapper from 'src/application/mapper/village-profile.mapper';

@Module({
  controllers: [TransporterRequestController],
  providers: [
    VillageService,
    VillageRepository,
    UserRoleRepository,
    UsersRepository,
    VillageMapper,
    TransporterVillageRepository,
    VillageProfileRepository,
    VillageProfileMapper,
  ],
})
export class TransporterRequestModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('transporter-request');
  }
}

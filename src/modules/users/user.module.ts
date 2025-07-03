import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import UserController from './user.controller';
import UserService from 'src/core/services/users/user.service';
import UsersRepository from 'src/infrastructure/postgres/repositories/users.repository';
import { CitizenMapper } from 'src/application/mapper/citizen.mapper';
import { AuthMiddleware } from 'src/middlewares/auth.middleware';
import UserRoleRepository from 'src/infrastructure/postgres/repositories/user-role.repository';
import PointRepository from 'src/infrastructure/postgres/repositories/point.repository';
import { VerificatorMapper } from 'src/application/mapper/verificator.mapper';
import VillageRepository from 'src/infrastructure/postgres/repositories/village.repository';
import AddressRepository from 'src/infrastructure/postgres/repositories/address.repository';
import VerificationService from 'src/core/services/verifications/verification.service';
import TrashRepository from 'src/infrastructure/postgres/repositories/trash.repository';
import VerificationRepository from 'src/infrastructure/postgres/repositories/verification.repository';
import TrashPartRepository from 'src/infrastructure/postgres/repositories/trash-part.repository';
import VillageProfileRepository from 'src/infrastructure/postgres/repositories/village-profile.repository';
import VillageService from 'src/core/services/villages/village.service';
import { VillageMapper } from 'src/application/mapper/village.mapper';
import TransporterVillageRepository from 'src/infrastructure/postgres/repositories/transporter-village.repository';
import VillageProfileMapper from 'src/application/mapper/village-profile.mapper';

@Module({
  providers: [
    UserService,
    VillageService,
    VillageMapper,
    TransporterVillageRepository,
    VerificationService,
    UsersRepository,
    CitizenMapper,
    VerificatorMapper,
    UserRoleRepository,
    PointRepository,
    VillageRepository,
    AddressRepository,
    TrashRepository,
    VerificationRepository,
    TrashPartRepository,
    VillageProfileRepository,
    VillageProfileMapper,
  ],
  controllers: [UserController],
  exports: [UsersRepository],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('citizens');
  }
}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import config from './config';
import { LoggerModule } from './infrastructure/logger/logger.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { VillageModule } from './modules/village/village.module';
import { TransporterModule } from './modules/transporters/transporter.module';
import { AddressModule } from './modules/addresses/address.module';
import { RatingModule } from './modules/rating/rating.module';
import { AuthModule } from './modules/auth/auth.module';
import { CarModule } from './modules/cars/car.module';
import { UserModule } from './modules/users/user.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TrashModule } from './modules/trash/trash.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [config],
    }),
    LoggerModule,
    PrismaModule,
    VillageModule,
    TransporterModule,
    AddressModule,
    RatingModule,
    AuthModule,
    CarModule,
    UserModule,
    TrashModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }

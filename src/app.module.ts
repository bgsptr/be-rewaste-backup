import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import config from './config';
import { LoggerModule } from './infrastructure/logger/logger.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { VillageModule } from './modules/village/village.module';
import { TransporterModule } from './modules/transporters/transporter.module';
import { AddressModule } from './modules/addresses/address.module';

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
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }

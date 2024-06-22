import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegramModule } from './telegram/telegram.module';
import { PointSystemService } from './point-system/point-system.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Telegram } from './telegram/entities/telegram.entity';
import { PointSystemModule } from './point-system/point-system.module';
import { ReferralModule } from './referral/referral.module';
import { Referral } from './referral/entities/referral.entity';
import { ReferralService } from './referral/referral.service';

@Module({
  imports: [
    TelegramModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        synchronize: true,
        ssl: { rejectUnauthorized: false }, // Отключение проверки SSL
        entities: [Telegram, Referral],
        toRetry(err) {
          return false;
        },
      }),
      inject: [ConfigService],
    }),
    PointSystemModule,
    ReferralModule,
  ],
  controllers: [AppController],
  providers: [AppService, PointSystemService, ReferralService],
})
export class AppModule {}

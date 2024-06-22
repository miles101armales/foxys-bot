import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Telegram } from './entities/telegram.entity';
import { PointSystemService } from 'src/point-system/point-system.service';
import { PointSystemModule } from 'src/point-system/point-system.module';
import { Referral } from 'src/referral/entities/referral.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Telegram, Referral]), PointSystemModule],
  controllers: [TelegramController],
  providers: [TelegramService],
  exports: [TelegramModule, TypeOrmModule],
})
export class TelegramModule {}

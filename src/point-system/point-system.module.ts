import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Telegram } from 'src/telegram/entities/telegram.entity';
import { PointSystemService } from './point-system.service';
import { TelegramModule } from 'src/telegram/telegram.module';

@Module({
  imports: [TypeOrmModule.forFeature([Telegram])],
  providers: [PointSystemService],
  exports: [PointSystemModule],
})
export class PointSystemModule {}

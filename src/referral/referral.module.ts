import { Module } from '@nestjs/common';
import { ReferralService } from './referral.service';
import { ReferralController } from './referral.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Referral } from './entities/referral.entity';
import { Telegram } from 'src/telegram/entities/telegram.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Referral, Telegram])],
  controllers: [ReferralController],
  providers: [ReferralService],
  exports: [TypeOrmModule],
})
export class ReferralModule {}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'telegraf/typings/core/types/typegram';
import { Repository } from 'typeorm';
import { Referral } from './entities/referral.entity';
import { Telegram } from 'src/telegram/entities/telegram.entity';

@Injectable()
export class ReferralService {
  constructor(
    @InjectRepository(Referral)
    private readonly referralRepository: Repository<Referral>,
  ) {}

  async createReferral(
    referringUser: Telegram,
    referredUser: Telegram,
  ): Promise<Referral> {
    const referral = this.referralRepository.create({
      referringUser,
      referredUser,
      createdAt: new Date(),
    });
    return this.referralRepository.save(referral);
  }
}

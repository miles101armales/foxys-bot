import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Referral } from './entities/referral.entity';
import { Telegram } from 'src/telegram/entities/telegram.entity';
import { PointSystemService } from 'src/point-system/point-system.service';

@Injectable()
export class ReferralService {
  private pointSystemService: PointSystemService;

  constructor(
    @InjectRepository(Referral)
    private readonly referralRepository: Repository<Referral>,
    @InjectRepository(Telegram)
    private readonly telegramRepository: Repository<Telegram>,
  ) {
    this.pointSystemService = new PointSystemService(this.telegramRepository);
  }

  async createReferral(
    referrer: string, // Предполагаю, что это должен быть chat_id пользователя
    referringUser: Telegram,
    referredUser1: Telegram,
  ): Promise<Referral> {
    const existingClient = await this.referralRepository.findOne({
      where: { chat_id: referrer },
    });

    if (existingClient) {
      // Проверяем, есть ли уже первый реферал
      if (existingClient.referredUser1) {
        // Если есть первый реферал, обновляем второго реферала
        await this.referralRepository.update(
          { chat_id: referrer },
          { referredUser2: referredUser1 },
        );
        this.pointSystemService.pointAdd(50, referrer);
      } else {
        // Если первого реферала еще нет, создаем новую запись
        const referral = this.referralRepository.create({
          chat_id: referrer,
          referringUser,
          referredUser1,
          referredUser2: null,
          createdAt: new Date(),
        });
        this.pointSystemService.pointAdd(100, referrer);
        return this.referralRepository.save(referral);
      }
    } else {
      // Если клиент еще не имеет реферальной записи, создаем новую
      const referral = this.referralRepository.create({
        chat_id: referrer,
        referringUser,
        referredUser1,
        referredUser2: null,
        createdAt: new Date(),
      });
      this.pointSystemService.pointAdd(100, referrer);
      return this.referralRepository.save(referral);
    }
  }
}

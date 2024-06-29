import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Referral } from './entities/referral.entity';
import { Telegram } from 'src/telegram/entities/telegram.entity';
import { PointSystemService } from 'src/point-system/point-system.service';

@Injectable()
export class ReferralService {
  private pointSystemService: PointSystemService;
  private logger = new Logger(ReferralService.name);
  constructor(
    @InjectRepository(Referral)
    private readonly referralRepository: Repository<Referral>,
    @InjectRepository(Telegram)
    private readonly telegramRepository: Repository<Telegram>,
  ) {
    this.pointSystemService = new PointSystemService(this.telegramRepository);
  }

  // async createReferral(
  //   chat_id: string, // chat_id приглашенного пользователя
  //   referringUser: Telegram, // корневой пользователь
  //   referredUser1: Telegram, // приглашенный пользователь
  // ) {
  //   // поиск операций от корневого пользователя
  //   const existReferringOperations = await this.referralRepository.findBy({ref_chat_id: referringUser.chat_id}) 

  //   // в случае если они есть
  //   for(const operation of existReferringOperations){
  //     this.logger.log(`+50 for finded ${operation.id}`)
  //     this.pointSystemService.pointAdd(50, referringUser.chat_id)
  //   }

  //   // сохраняем реферальную операцию
  //   const referral = this.referralRepository.create({
  //     chat_id,
  //     referringUser,
  //     referredUser1,
  //     ref_chat_id: referringUser.chat_id,
  //     createdAt: new Date(),
  //   });
  //   this.pointSystemService.pointAdd(100, chat_id);
  //   return this.referralRepository.save(referral);
  // }

  async createReferral(
    chat_id: string, 
    referringUserChatId: string, 
    referredUser1ChatId: string
  ) {
    // Ищем пользователя, который пригласил (реферера)
    const referringUser = await this.telegramRepository.findOne({ where: { chat_id: referringUserChatId } });
    if (!referringUser) {
      throw new Error('Referring user not found');
    }

    // Ищем пользователя, который был приглашен (реферал)
    const referredUser1 = await this.telegramRepository.findOne({ where: { chat_id: referredUser1ChatId } });
    if (!referredUser1) {
      throw new Error('Referred user not found');
    }

    // Начисляем баллы за первого уровня рефералов
    this.pointSystemService.pointAdd(100, referringUser.chat_id);

    const referalFather = await this.referralRepository.findOne({where: {chat_id: referringUser.chat_id}})
    if(referalFather) {
      await this.pointSystemService.pointAdd(50, referalFather.ref_chat_id)
    }


    // Сохраняем реферальную операцию
    const referral = this.referralRepository.create({
      chat_id,
      referringUser,
      referredUser1,
      ref_chat_id: referringUser.chat_id,
      createdAt: new Date(),
    });
    return this.referralRepository.save(referral);
  }
}

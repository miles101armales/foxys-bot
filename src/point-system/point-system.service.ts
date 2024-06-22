import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Telegram } from 'src/telegram/entities/telegram.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PointSystemService {
  private readonly logger = new Logger(PointSystemService.name);
  constructor(
    @InjectRepository(Telegram)
    private readonly telegramRepository: Repository<Telegram>,
  ) {}

  async pointAdd(points: number, chat_id: string): Promise<number> {
    const client = await this.telegramRepository.findOne({
      where: { chat_id },
    });
    const actual_points = client.point_balance;
    const update = actual_points + points;
    await this.telegramRepository.update(
      { chat_id },
      { point_balance: update },
    );

    return update;
  }
}

import { Telegraf } from 'telegraf';
import { Command } from '../classes/command.class';
import { MyContext } from '../interfaces/context.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Telegram } from '../entities/telegram.entity';

export class ReferalsCommand extends Command {
  constructor(
    client: Telegraf<MyContext>,
    @InjectRepository(Telegram)
    private readonly telegramRepository: Repository<Telegram>,
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    this.client.action('referals', async (ctx: MyContext) => {
      this.handled(ctx);
    });
    this.client.command('referals', async (ctx: MyContext) => {
      this.handled(ctx);
    });
  }

  async handled(ctx: MyContext): Promise<void> {
    const ref_link = `https://t.me/test_foxy_190924_bot?start=${ctx.chat.id}`;
      await this.telegramRepository.update(
        { chat_id: ctx.chat.id.toString() },
        { referrer: ctx.chat.id.toString() },
      );
      this.client.telegram.sendPhoto(
        ctx.chat.id,
        { source: 'src/telegram/public/referrals.png' },
        {
          caption: `Поделись этой ссылкой с друзьями: ${ref_link}`,
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Вернуться в главное меню', callback_data: 'menu' }],
            ],
          },
        },
      );
    
  }
}

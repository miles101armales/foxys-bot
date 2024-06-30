import { Telegraf } from 'telegraf';
import { Command } from '../classes/command.class';
import { MyContext } from '../interfaces/context.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Telegram } from '../entities/telegram.entity';
import { Logger } from '@nestjs/common';

export class ReferalsCommand extends Command {
  private logger = new Logger(ReferalsCommand.name);
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
    this.logger.log(
      `${ctx.from.username ? ctx.from.username : ctx.from.id} запросил реферальную ссылку`,
    );
    const ref_link = `https://t.me/test_foxy_190924_bot?start=${ctx.chat.id}`;
    await this.telegramRepository.update(
      { chat_id: ctx.chat.id.toString() },
      { referrer: ctx.chat.id.toString() },
    );
    this.client.telegram.sendPhoto(
      ctx.chat.id,
      { source: 'src/telegram/public/referrals.png' },
      {
        caption:
          `Чем больше нас будет, тем сильнее мы станем. 

Пригласи своих друзей присоединиться по твоей уникальной реферальной ссылке, получай 100 поинтов за каждого, а также 50 очков за их рефералов. 

Награда будет по истине легендарной!\n\n` + `${ref_link}`,
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Вернуться в главное меню', callback_data: 'menu' }],
          ],
        },
      },
    );
    await ctx.deleteMessage(ctx.msg.message_id);
  }
}

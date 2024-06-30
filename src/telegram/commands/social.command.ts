import { Telegraf } from 'telegraf';
import { Command } from '../classes/command.class';
import { MyContext } from '../interfaces/context.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Telegram } from '../entities/telegram.entity';
import { Logger } from '@nestjs/common';

export class SocialCommand extends Command {
  private logger = new Logger(SocialCommand.name);
  constructor(
    client: Telegraf<MyContext>,
    @InjectRepository(Telegram)
    private readonly telegramRepository: Repository<Telegram>,
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    this.client.action('social', async (ctx: MyContext) => {
      this.handled(ctx);
    });
    this.client.command('social', async (ctx: MyContext) => {
      this.handled(ctx);
    });
  }

  async handled(ctx: MyContext): Promise<void> {
    this.logger.log(
      `${ctx.from.username ? ctx.from.username : ctx.from.id} запросил соц сети`,
    );
    ctx.reply(
      `✨ Присоединяйтесь к нашим соцсетям и будьте в курсе всех новостей\!🌐\n\n` +
        `🐦 [Twitter](https://x.com/foxiesonton?s=21)\n` +
        `📘 [Telegram](https://t.me/+uMs3twWyNpo2NDEy)\n\n` +
        `🔔 Подписывайтесь и не пропустите самое интересное\!🚀`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Вернуться в главное меню', callback_data: 'menu' }],
          ],
        },
        parse_mode: 'Markdown',
      },
    );
  }
}

import { Telegraf } from 'telegraf';
import { Command } from '../classes/command.class';
import { MyContext } from '../interfaces/context.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Telegram } from '../entities/telegram.entity';

export class SocialCommand extends Command {
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
    ctx.reply(`✨ Присоединяйтесь к нашим соцсетям и будьте в курсе всех новостей! 🌐

📸 Instagram: [ваша ссылка]
🐦 Twitter: [ваша ссылка]
📘 Facebook: [ваша ссылка]

🔔 Подписывайтесь и не пропустите самое интересное! 🚀`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Вернуться в главное меню', callback_data: 'menu' }],
        ],
      },
    });
  }
}

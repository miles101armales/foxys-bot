import { Telegraf } from 'telegraf';
import { Command } from '../classes/command.class';
import { MyContext } from '../interfaces/context.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Telegram } from '../entities/telegram.entity';

export class LeaderboardCommand extends Command {
  constructor(
    client: Telegraf<MyContext>,
    @InjectRepository(Telegram)
    private readonly telegramRepository: Repository<Telegram>,
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    this.client.action('leaderboard', async (ctx: MyContext) => {
      await this.handled(ctx);
    });
    this.client.command('leaderboard', async (ctx: MyContext) => {
      await this.handled(ctx);
    });
  }

  async handled(ctx: MyContext): Promise<void> {
    // Извлекаем и сортируем пользователей по point_balance в порядке убывания
    const users = await this.telegramRepository.find({
      order: { point_balance: 'DESC' },
      take: 10, // Берем только первые 10 пользователей
    });

    // Формируем текст таблицы лидеров
    let leaderboardText = '🏆 Таблица лидеров 🏆\n\n';

    users.forEach((user, index) => {
      leaderboardText += `<b>${index + 1}. ${user.username || user.name}</b> - <u>${user.point_balance} баллов</u>\n`;
    });

    leaderboardText += '------------------------------\n';

    const currentUserId = ctx.message.chat.id; // Получаем chat_id текущего пользователя
    const currentUser = await this.telegramRepository.findOne({
      where: { chat_id: currentUserId.toString() },
    });
    if (currentUser) {
      const position = users.findIndex(
        (user) => user.chat_id === currentUserId.toString(),
      );
      if (position !== -1) {
        leaderboardText += `Ваше место: ${position + 1}\n`;
      }
    }

    // Отправляем сообщение с таблицей лидеров
    await ctx.replyWithHTML(leaderboardText, {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Вернуться в главное меню', callback_data: 'menu' }],
        ],
      },
    });
  }
}

import { Telegraf } from 'telegraf';
import { Command } from '../classes/command.class';
import { MyContext } from '../interfaces/context.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Telegram } from '../entities/telegram.entity';
import { Logger } from '@nestjs/common';

export class LeaderboardCommand extends Command {
  private logger = new Logger(LeaderboardCommand.name);
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
    this.logger.log(
      `${ctx.from.username ? ctx.from.username : ctx.from.id} запросил список лидеров`,
    );
    // Извлекаем и сортируем пользователей по point_balance в порядке убывания
    const users = await this.telegramRepository.find({
      order: { point_balance: 'DESC' },
      take: 10, // Берем только первые 10 пользователей
    });

    // Формируем текст таблицы лидеров
    let leaderboardText = '🏆 Таблица лидеров 🏆\n\n';

    users.forEach((user, index) => {
      // Формируем строку для каждого пользователя
      let userLine = `<b>${index + 1}. `;

      // Если есть username или name, добавляем его в строку
      if (user.username || user.name) {
        userLine += `${user.username || user.name}`;
      }

      // Добавляем разделитель и баллы пользователя
      userLine += `</b> - <u>${user.point_balance} баллов</u>\n`;

      // Добавляем сформированную строку в текст таблицы лидеров
      leaderboardText += userLine;
    });

    leaderboardText += '------------------------------\n';

    const currentUserId = ctx.chat.id; // Получаем chat_id текущего пользователя
    const currentUser = await this.telegramRepository.findOne({
      where: { chat_id: currentUserId.toString() },
    });
    if (currentUser) {
      const position = users.findIndex(
        (user) => user.chat_id === currentUserId.toString(),
      );
      if (position !== -1) {
        leaderboardText += `Ваше место: <b>${position + 1}\n</b>`;
      }
    }

    // Отправляем сообщение с таблицей лидеров, используя HTML-форматирование
    await ctx.replyWithHTML(leaderboardText, {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Вернуться в главное меню', callback_data: 'menu' }],
        ],
      },
      parse_mode: 'HTML', // Указываем, что используем HTML для форматирования текста
    });
    await ctx.deleteMessage(ctx.msg.message_id);
  }
}

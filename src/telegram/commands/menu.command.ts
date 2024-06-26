import { Telegraf } from 'telegraf';
import { Command } from '../classes/command.class';
import { MyContext } from '../interfaces/context.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Telegram } from '../entities/telegram.entity';
import { Logger } from '@nestjs/common';

export class MenuCommand extends Command {
  private logger = new Logger(MenuCommand.name);
  constructor(
    client: Telegraf<MyContext>,
    @InjectRepository(Telegram)
    private readonly telegramRepository: Repository<Telegram>,
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    this.client.hears('🦊Меню🦊', async (ctx: MyContext) => {
      this.logger.log(
        `${ctx.from.username ? ctx.from.username : ctx.from.id} запросил меню`,
      );
      const client = await this.telegramRepository.findOne({
        where: { chat_id: ctx.chat.id.toString() },
        relations: ['referrals'],
      });
      this.client.telegram.sendPhoto(
        ctx.chat.id,
        { source: 'src/telegram/public/img2.jpeg' },
        {
          caption:
            `Ваш баланс: ${client.point_balance}\n` +
            `Ваши рефералы: ${client.referrals.length}\n` +
            `Чем займемся сегодня, мой друг?`,
          reply_markup: {
            inline_keyboard: [
              [{ text: '🦊Выполнить задания🦊', callback_data: 'tasks' }],
              [{ text: '👤Пригласить друзей👤', callback_data: 'referals' }],
              [
                { text: '💰Баланс', callback_data: 'balance' },
                { text: '🏆Лидеры', callback_data: 'leaderboard' },
              ],
              [{ text: '⚡Соц. сети', callback_data: 'social' }],
            ],
          },
        },
      );
      await ctx.deleteMessage(ctx.msg.message_id);
    });

    this.client.action('menu', (ctx) => {
      this.handled(ctx);
    });
  }

  async handled(ctx) {
    const client = await this.telegramRepository.findOne({
      where: { chat_id: ctx.chat.id.toString() },
      relations: ['referrals'],
    });
    this.client.telegram.sendPhoto(
      ctx.chat.id,
      { source: 'src/telegram/public/img2.jpeg' },
      {
        caption:
          `Ваш баланс: ${client.point_balance}\n` +
          `Ваши рефералы: ${client.referrals.length}\n` +
          `Чем займемся сегодня, мой друг?`,
        reply_markup: {
          inline_keyboard: [
            [{ text: '🦊Выполнить задания🦊', callback_data: 'tasks' }],
            [{ text: '👤Пригласить друзей👤', callback_data: 'referals' }],
            [
              { text: '💰Баланс', callback_data: 'balance' },
              { text: '🏆Лидеры', callback_data: 'leaderboard' },
            ],
            [
              { text: '⚡Соц. сети', callback_data: 'social' },
              { text: '♨️Язык', callback_data: 'language' },
            ],
          ],
        },
      },
    );
    await ctx.deleteMessage(ctx.msg.message_id);
  }
}

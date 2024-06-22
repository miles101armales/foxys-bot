import { Telegraf } from 'telegraf';
import { Command } from '../classes/command.class';
import { MyContext } from '../interfaces/context.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Telegram } from '../entities/telegram.entity';

export class TasksCommand extends Command {
  constructor(
    client: Telegraf<MyContext>,
    @InjectRepository(Telegram)
    private readonly telegramRepository: Repository<Telegram>,
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    this.client.action('tasks', async (ctx: MyContext) => {
      this.handled(ctx);
    });
    this.client.command('tasks', async (ctx: MyContext) => {
      this.handled(ctx);
    });
  }

  async handled(ctx: MyContext): Promise<void> {
    const buttons = [
      [{ text: 'Пригласи 5 человек', callback_data: 'invite_5_people' }],
      [{ text: 'Подпишись на Twitter', callback_data: 'subscribe_twitter' }],
      [{ text: 'Подпишись на канал', callback_data: 'subscribe_channel' }],
      [{ text: 'Подпишись на чат', callback_data: 'subscribe_chat' }],
      [{ text: 'Буст канала', callback_data: 'boost_channel' }],
      [{ text: 'Прочитай инструкцию', callback_data: 'read_instructions' }],
      [{ text: 'Добавить тикер в ник', callback_data: 'add_ticker_to_nick' }],
      [{ text: 'Вернуться в главное меню', callback_data: 'menu' }],
    ];
    ctx.deleteMessage(ctx.msg.message_id);
    ctx.reply('Вам доступны следующие задания!', {
      reply_markup: { inline_keyboard: buttons },
    });
  }
}

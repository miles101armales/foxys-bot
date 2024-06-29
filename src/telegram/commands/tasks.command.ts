import { Telegraf } from 'telegraf';
import { Command } from '../classes/command.class';
import { MyContext } from '../interfaces/context.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Telegram } from '../entities/telegram.entity';
import { PointSystemService } from 'src/point-system/point-system.service';

export class TasksCommand extends Command {
  constructor(
    client: Telegraf<MyContext>,
    @InjectRepository(Telegram)
    private readonly telegramRepository: Repository<Telegram>,
    private readonly pointSystemService: PointSystemService,
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
      [{ text: 'Добавить foxy в ник', callback_data: 'add_ticker_to_nick' }],
      [{ text: 'Вернуться в главное меню', callback_data: 'menu' }],
    ];
    ctx.deleteMessage(ctx.msg.message_id);
    ctx.reply('Вам доступны следующие задания!', {
      reply_markup: { inline_keyboard: buttons },
    });

    this.client.action('invite_5_people', async ctx => {
      const client = await this.telegramRepository.findOne({
        where: { chat_id: ctx.chat.id.toString() },
        relations: ['referrals'],
      });
      if(client.referrals.length == 5) {
        ctx.reply('Задание успешно выполнено\n\nВам начислено 500 баллов', {reply_markup: {inline_keyboard: [[{ text: 'Вернуться в главное меню', callback_data: 'menu' }]]}});
        return this.pointSystemService.pointAdd(500, ctx.chat.id.toString())
      } else {
        return ctx.reply('Задание не выполнено\n\nВозвращайся, когда выполнишь', {reply_markup: {inline_keyboard: [[{ text: 'Вернуться в главное меню', callback_data: 'menu' }]]}});
      }
    })

    this.client.action('subscribe_twitter', async ctx => {
      ctx.reply('Задание успешно выполнено\n\nВам начислено 500 баллов', {reply_markup: {inline_keyboard: [[{ text: 'Вернуться в главное меню', callback_data: 'menu' }]]}});
      return this.pointSystemService.pointAdd(500, ctx.chat.id.toString())
    })

    this.client.action('subscribe_channel', async ctx => {
      ctx.reply('Задание успешно выполнено\n\nВам начислено 500 баллов', {reply_markup: {inline_keyboard: [[{ text: 'Вернуться в главное меню', callback_data: 'menu' }]]}});
      return this.pointSystemService.pointAdd(500, ctx.chat.id.toString())
    })

    this.client.action('subscribe_chat', async ctx => {
      ctx.reply('Задание успешно выполнено\n\nВам начислено 500 баллов', {reply_markup: {inline_keyboard: [[{ text: 'Вернуться в главное меню', callback_data: 'menu' }]]}});
      return this.pointSystemService.pointAdd(500, ctx.chat.id.toString())
    })

    this.client.action('boost_channel', async ctx => {
      ctx.reply('Задание успешно выполнено\n\nВам начислено 500 баллов', {reply_markup: {inline_keyboard: [[{ text: 'Вернуться в главное меню', callback_data: 'menu' }]]}});
      return this.pointSystemService.pointAdd(500, ctx.chat.id.toString())
    })

    this.client.action('read_instructions', async ctx => {
      ctx.reply('Задание успешно выполнено\n\nВам начислено 500 баллов', {reply_markup: {inline_keyboard: [[{ text: 'Вернуться в главное меню', callback_data: 'menu' }]]}});
      return this.pointSystemService.pointAdd(500, ctx.chat.id.toString())
    })

    this.client.action('add_ticker_to_nick', async ctx => {
      if(ctx.from.username.includes('foxy')) {
        ctx.reply('Задание успешно выполнено\n\nВам начислено 500 баллов', {reply_markup: {inline_keyboard: [[{ text: 'Вернуться в главное меню', callback_data: 'menu' }]]}});
        return this.pointSystemService.pointAdd(500, ctx.chat.id.toString())
      } else {
        return ctx.reply('Задание не выполнено\n\nВозвращайся, когда выполнишь', {reply_markup: {inline_keyboard: [[{ text: 'Вернуться в главное меню', callback_data: 'menu' }]]}});
      }
    })
  }
}

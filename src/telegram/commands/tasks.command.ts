import { Markup, Telegraf } from 'telegraf';
import { Command } from '../classes/command.class';
import { MyContext } from '../interfaces/context.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Telegram } from '../entities/telegram.entity';
import { PointSystemService } from 'src/point-system/point-system.service';
import { Logger } from '@nestjs/common';

interface Button {
  text: string;
  callback_data: string;
}

export class TasksCommand extends Command {
  private logger = new Logger(TasksCommand.name);
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
    this.logger.log(
      `${ctx.from.username ? ctx.from.username : ctx.from.id} запросил список заданий`,
    );
    const client = await this.telegramRepository.findOne({
      where: { chat_id: ctx.chat.id.toString() },
      relations: ['referrals'],
    });
    let prize: number = 500;
    let people: number = 5;

    if (client.referrals.length < 5) {
      prize = 500;
      people = 5;
    } else if (client.referrals.length < 10) {
      prize = 10000;
      people = 10;
    } else if (client.referrals.length < 15) {
      prize = 20000;
      people = 20;
    } else if (client.referrals.length < 35) {
      prize = 50000;
      people = 50;
    } else if (client.referrals.length < 85) {
      prize = 100000;
      people = 100;
    } else if (client.referrals.length < 185) {
      prize = 500000;
      people = 500;
    } else if (client.referrals.length < 685) {
      prize = 1000000;
      people = 1000;
    } else if (client.referrals.length > 1685) {
      await this.telegramRepository.update(
        { chat_id: ctx.chat.id.toString() },
        { task_invite: true },
      );
    }

    let buttons: Button[][] = [
      [
        {
          text: `Пригласи ${people} человек (+${prize})`,
          callback_data: 'invite_5_people',
        },
      ],
      [{ text: 'Подпишись на Twitter', callback_data: 'subscribe_twitter' }],
      [{ text: 'Подпишись на канал', callback_data: 'subscribe_channel' }],
      [{ text: 'Подпишись на чат', callback_data: 'subscribe_chat' }],
      [{ text: 'Буст канала', callback_data: 'boost_channel' }],
      [{ text: 'Прочитай инструкцию', callback_data: 'read_instructions' }],
      [{ text: 'Добавить foxy в ник', callback_data: 'add_ticker_to_nick' }],
      [{ text: 'Вернуться в главное меню', callback_data: 'menu' }],
    ];

    if (client.task_invite === true) {
      buttons = buttons.filter(
        (button) =>
          !(button.length === 1 && button[0].text === 'Подпишись на Twitter'),
      );
    }
    if (client.task_twitter === true) {
      buttons = buttons.filter(
        (button) =>
          !(button.length === 1 && button[0].text === 'Подпишись на Twitter'),
      );
    }
    if (client.task_channel === true) {
      buttons = buttons.filter(
        (button) =>
          !(button.length === 1 && button[0].text === 'Подпишись на канал'),
      );
    }
    if (client.task_chat === true) {
      buttons = buttons.filter(
        (button) =>
          !(button.length === 1 && button[0].text === 'Подпишись на чат'),
      );
    }
    if (client.task_boost === true) {
      buttons = buttons.filter(
        (button) => !(button.length === 1 && button[0].text === 'Буст канала'),
      );
    }
    if (client.task_instructions === true) {
      buttons = buttons.filter(
        (button) =>
          !(button.length === 1 && button[0].text === 'Прочитай инструкцию'),
      );
    }
    if (client.task_ticker === true) {
      buttons = buttons.filter(
        (button) =>
          !(button.length === 1 && button[0].text === 'Добавить foxy в ник'),
      );
    }

    await ctx.deleteMessage(ctx.msg.message_id);
    await ctx.reply(
      `Защитники, настало время для новых подвигов! 

Мы предлагаем охотникам принять участие в важных миссиях, чтобы защитить наш виртуальный лес от хитрых хомяков и других угроз. 

Вот список актуальных заданий:`,
      {
        reply_markup: { inline_keyboard: buttons },
      },
    );

    this.client.action('invite_5_people', async (ctx) => {
      if (client.referrals.length == people) {
        await ctx.deleteMessage(ctx.msg.message_id);
        ctx.reply(
          `Задание успешно выполнено\n\nВам начислено ${prize} баллов`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: 'Вернуться в главное меню', callback_data: 'menu' }],
              ],
            },
          },
        );
        this.logger.log(
          `${ctx.from.username ? ctx.from.username : ctx.from.id} выполнен задание по инвайтам ${people} человек`,
        );
        return this.pointSystemService.pointAdd(prize, ctx.chat.id.toString());
      } else {
        await ctx.deleteMessage(ctx.msg.message_id);
        return ctx.reply(
          'Задание не выполнено\n\nВозвращайся, когда выполнишь',
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: 'Вернуться в главное меню', callback_data: 'menu' }],
              ],
            },
          },
        );
      }
    });

    this.client.action('subscribe_twitter', async (ctx) => {
      await ctx.deleteMessage(ctx.msg.message_id);
      ctx.sendMessage(
        `Подпишись, по кнопке ниже`,
        Markup.inlineKeyboard([
          Markup.button.url(`Подписаться`, `https://x.com/foxiesonton?s=21`),
          Markup.button.callback(`Проверить`, `check_twitter`),
        ]),
      );

      this.client.action('check_twitter', async (ctx) => {
        ctx.reply('Задание успешно выполнено\n\nВам начислено 500 баллов', {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Вернуться в главное меню', callback_data: 'menu' }],
            ],
          },
        });
        await this.telegramRepository.update(
          { chat_id: ctx.chat.id.toString() },
          { task_twitter: true },
        );
        this.logger.log(
          `${ctx.from.username ? ctx.from.username : ctx.from.id} выполнен задание по подписке на твиттер`,
        );
        await ctx.deleteMessage(ctx.msg.message_id);
        return this.pointSystemService.pointAdd(500, ctx.chat.id.toString());
      });
    });

    this.client.action('subscribe_channel', async (ctx) => {
      await ctx.deleteMessage(ctx.msg.message_id);
      ctx.sendMessage(
        `Подпишись, по кнопке ниже`,
        Markup.inlineKeyboard([
          Markup.button.url(`Подписаться`, `https://t.me/+uMs3twWyNpo2NDEy`),
          Markup.button.callback(`Проверить`, `check_channel`),
        ]),
      );

      this.client.action('check_channel', async (ctx) => {
        ctx.reply('Задание успешно выполнено\n\nВам начислено 500 баллов', {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Вернуться в главное меню', callback_data: 'menu' }],
            ],
          },
        });
        await this.telegramRepository.update(
          { chat_id: ctx.chat.id.toString() },
          { task_channel: true },
        );
        this.logger.log(
          `${ctx.from.username ? ctx.from.username : ctx.from.id} выполнен задание по подписке на канал`,
        );
        await ctx.deleteMessage(ctx.msg.message_id);
        return this.pointSystemService.pointAdd(500, ctx.chat.id.toString());
      });
    });

    this.client.action('subscribe_chat', async (ctx) => {
      await ctx.deleteMessage(ctx.msg.message_id);
      ctx.reply('Чат еще не создан. Ожидайте', {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Вернуться в главное меню', callback_data: 'menu' }],
          ],
        },
      });
      // await this.telegramRepository.update(
      //   { chat_id: ctx.chat.id.toString() },
      //   { task_chat: true },
      // );
      // this.logger.log(
      //   `${ctx.from.username ? ctx.from.username : ctx.from.id} выполнен задание по подписке на чат`,
      // );
      // return this.pointSystemService.pointAdd(500, ctx.chat.id.toString());
    });

    this.client.action('boost_channel', async (ctx) => {
      await ctx.deleteMessage(ctx.msg.message_id);
      ctx.sendMessage(
        `Подпишись, по кнопке ниже`,
        Markup.inlineKeyboard([
          Markup.button.url(`Забустить`, `https://t.me/+uMs3twWyNpo2NDEy`),
          Markup.button.callback(`Проверить`, `checkboost`),
        ]),
      );
      this.client.action('checkboost', async (ctx) => {
        ctx.reply('Задание успешно выполнено\n\nВам начислено 500 баллов', {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Вернуться в главное меню', callback_data: 'menu' }],
            ],
          },
        });
        await this.telegramRepository.update(
          { chat_id: ctx.chat.id.toString() },
          { task_boost: true },
        );
        this.logger.log(
          `${ctx.from.username ? ctx.from.username : ctx.from.id} выполнен задание по бусту канала`,
        );
        await ctx.deleteMessage(ctx.msg.message_id);
        return await this.pointSystemService.pointAdd(500, ctx.chat.id.toString());
      });
    });

    this.client.action('read_instructions', async (ctx) => {
      await ctx.deleteMessage(ctx.msg.message_id);
      ctx.reply('Инструкции в разработке', {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Вернуться в главное меню', callback_data: 'menu' }],
          ],
        },
      });
      // await this.telegramRepository.update(
      //   { chat_id: ctx.chat.id.toString() },
      //   { task_instructions: true },
      // );
      // this.logger.log(
      //   `${ctx.from.username ? ctx.from.username : ctx.from.id} выполнен задание по прочтению инструкции`,
      // );
      // return this.pointSystemService.pointAdd(500, ctx.chat.id.toString());
    });

    this.client.action('add_ticker_to_nick', async (ctx) => {
      if (ctx.from.username) {
        if (/\w+_foxy$/.test(ctx.from.username)) {
          ctx.reply('Задание успешно выполнено\n\nВам начислено 500 баллов', {
            reply_markup: {
              inline_keyboard: [
                [{ text: 'Вернуться в главное меню', callback_data: 'menu' }],
              ],
            },
          });
          await this.telegramRepository.update(
            { chat_id: ctx.chat.id.toString() },
            { task_ticker: true },
          );
          this.logger.log(
            `${ctx.from.username ? ctx.from.username : ctx.from.id} выполнен задание по добавлению тикера в ник инструкции`,
          );
          await ctx.deleteMessage(ctx.msg.message_id);
          return this.pointSystemService.pointAdd(500, ctx.chat.id.toString());
        } else {
          await ctx.deleteMessage(ctx.msg.message_id);
          return ctx.reply(
            'Задание не выполнено\n\nВозвращайся, когда выполнишь',
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: 'Вернуться в главное меню', callback_data: 'menu' }],
                ],
              },
            },
          );
        }
      } else {
        await ctx.deleteMessage(ctx.msg.message_id);
        return ctx.reply(
          'Задание не выполнено\n\nВозвращайся, когда ник будет доступен',
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: 'Вернуться в главное меню', callback_data: 'menu' }],
              ],
            },
          },
        );
      }
    });
    ctx.deleteMessage(ctx.msg.message_id);
  }
  
}

import { Context, Markup, Telegraf } from 'telegraf';
import { Command } from '../classes/command.class';
import { MyContext } from '../interfaces/context.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Telegram } from '../entities/telegram.entity';
import { PointSystemService } from 'src/point-system/point-system.service';
import { ReferralService } from 'src/referral/referral.service';
import { Logger } from '@nestjs/common';
import { MenuCommand } from './menu.command';

export class StartCommand extends Command {
  private readonly logger = new Logger(StartCommand.name);
  constructor(
    client: Telegraf<MyContext>,
    @InjectRepository(Telegram)
    private readonly telegramRepository: Repository<Telegram>,
    private readonly pointSystemService: PointSystemService,
    private readonly referralService: ReferralService,
    private readonly menuCommand: MenuCommand,
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    this.client.start(async (ctx) => {
      const exisingClient = await this.telegramRepository.findOne({
        where: { chat_id: ctx.chat.id.toString() },
      });

      if (!exisingClient) {
        await this.telegramRepository.save({
          chat_id: ctx.chat.id.toString(),
          username: ctx.from.username,
          name: ctx.from.first_name,
        });
      } else {
        return this.menuCommand.handled(ctx);
      }

      console.log('start');
      this.capcha(ctx);
      const userId = ctx.chat.id.toString();
      const username = ctx.from.username;
      let referrer: number | null = null;

      if (ctx.msg.text.split(' ').length > 1) {
        const referrerCandidate = ctx.message.text.split(' ')[1];

        try {
          const referrerCandidateInt = parseInt(referrerCandidate, 10);

          if (
            userId !== referrerCandidate &&
            (await this.telegramRepository.exists({
              where: { referrer: referrerCandidateInt },
            }))
          ) {
            referrer = referrerCandidateInt;
          }
        } catch (error) {
          this.logger.error('Error parsing referrer candidate', error);
        }
      }

      const user = await this.telegramRepository.findOne({
        where: { chat_id: userId },
      });

      if (referrer && !user.referrer) {
        const referringUser = await this.telegramRepository.findOne({
          where: { referrer },
          relations: ['referrals'],
        });
        if (referringUser) {
          await this.referralService.createReferral(referringUser, user);
        }
      }
    });
  }

  async handled(ctx: Context): Promise<void> {
    this.client.telegram.sendMessage(
      ctx.chat.id,
      'Добро пожаловать в меню, охотник!\n\n' +
        'Хороший день, чтобы поймать пару хомячков! Ваш бонус за приветствие: 100 HAMSTERS!\n\n',
      Markup.keyboard([Markup.button.callback('🦊Меню🦊', 'Меню')]).resize(),
    );
    this.pointSystemService.pointAdd(100, ctx.chat.id.toString());

    const refer = await this.telegramRepository.findOne({
      where: { chat_id: ctx.chat.id.toString() },
      relations: ['referrals'],
    });

    console.log(refer.referrals.length);
  }

  async capcha(ctx): Promise<boolean> {
    let status: boolean;
    const buttons = [
      { text: '🐹', callback_data: 'false' },
      { text: '🐹', callback_data: 'false' },
      { text: '🐹', callback_data: 'false' },
      { text: '🦊', callback_data: 'true' },
      { text: '🐹', callback_data: 'false' },
      { text: '🐹', callback_data: 'false' },
    ];

    // Функция для перемешивания массива
    function shuffle(array: { text: string; callback_data: string }[]) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }

    shuffle(buttons);

    const inlineKeyboard = [];
    while (buttons.length) {
      inlineKeyboard.push(buttons.splice(0, 3));
    }

    ctx.reply(
      'Для доступа к боту пройдите капчу.\n\n Выберите смайлик с лисой ниже',
      {
        reply_markup: {
          inline_keyboard: inlineKeyboard,
        },
      },
    );

    this.client.action('true', async (ctx: Context) => {
      this.handled(ctx);
    });

    this.client.action('false', async (ctx: Context) => {
      this.capcha(ctx);
    });

    return status;
  }

  async findOrCreate(chat_id, username) {
    let user = await this.telegramRepository.findOne({ where: { chat_id } });
    if (!user) {
      user = this.telegramRepository.create({ chat_id, username });
      await this.telegramRepository.save(user);
    }
    return user;
  }
}

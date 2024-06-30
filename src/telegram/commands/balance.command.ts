import { Telegraf } from 'telegraf';
import { Command } from '../classes/command.class';
import { MyContext } from '../interfaces/context.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Telegram } from '../entities/telegram.entity';
import { Logger } from '@nestjs/common';

export class BalanceCommand extends Command {
  private logger = new Logger(BalanceCommand.name);
  constructor(
    client: Telegraf<MyContext>,
    @InjectRepository(Telegram)
    private readonly telegramRepository: Repository<Telegram>,
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    this.client.action('balance', async (ctx: MyContext) => {
      this.handled(ctx);
    });
    this.client.command('balance', async (ctx: MyContext) => {
      this.handled(ctx);
    });
  }

  async handled(ctx: MyContext): Promise<void> {
    this.logger.log(
      `${ctx.from.username ? ctx.from.username : ctx.from.id} запросил баланс`,
    );
    ctx.deleteMessages([ctx.msg.message_id, ctx.msg.message_id - 1]);
    const client = await this.telegramRepository.findOne({
      where: { chat_id: ctx.chat.id.toString() },
      relations: ['referrals'],
    });
    ctx.replyWithHTML(
      `Каждый вклад в защиту леса и активное участие будут вознаграждены!\n\nПроверь свой баланс: <b><u>${client.point_balance}</u></b>`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Вернуться в главное меню', callback_data: 'menu' }],
          ],
        },
      },
    );
  }
}

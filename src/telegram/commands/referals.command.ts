import { Telegraf } from 'telegraf';
import { Command } from '../classes/command.class';
import { MyContext } from '../interfaces/context.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Telegram } from '../entities/telegram.entity';

export class ReferalsCommand extends Command {
  constructor(
    client: Telegraf<MyContext>,
    @InjectRepository(Telegram)
    private readonly telegramRepository: Repository<Telegram>,
  ) {
    super(client);
  }

  async handle(): Promise<void> {
    this.client.action('referals', async (ctx: MyContext) => {
      this.handled(ctx);
    });
    this.client.command('referals', async (ctx: MyContext) => {
      this.handled(ctx);
    });
  }

  async handled(ctx: MyContext): Promise<void> {
    ctx.reply('Ваши рефералы');
  }
}
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { CreateTelegramDto } from './dto/create-telegram.dto';
import { UpdateTelegramDto } from './dto/update-telegram.dto';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Telegram } from './entities/telegram.entity';
import { Repository } from 'typeorm';
import { Scenes, Telegraf } from 'telegraf';
import { MyContext } from './interfaces/context.interface';
import { Command } from './classes/command.class';
import { Scene } from './classes/scene.class';
import { error } from 'console';
import { StartCommand } from './commands/start.command';
import { MenuCommand } from './commands/menu.command';
import { TasksCommand } from './commands/tasks.command';
import { ReferalsCommand } from './commands/referals.command';
import { BalanceCommand } from './commands/balance.command';
import { LeaderboardCommand } from './commands/leaderboard.command';
import { SocialCommand } from './commands/social.command';
import { LanguageCommand } from './commands/language.command';
import { PointSystemService } from 'src/point-system/point-system.service';
import { ReferralService } from 'src/referral/referral.service';
import { Referral } from 'src/referral/entities/referral.entity';

@Injectable()
export class TelegramService implements OnApplicationBootstrap {
  public readonly client: Telegraf<MyContext>;
  private commands: Command[] = [];
  private scenes: Scene[] = [];
  private scenesNames: Scenes.BaseScene<MyContext>[] = [];
  private readonly logger = new Logger(TelegramService.name);
  private pointSystemService: PointSystemService;
  private referralService: ReferralService;
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Telegram)
    private readonly telegramRepository: Repository<Telegram>,
    @InjectRepository(Referral)
    private readonly referralRepository: Repository<Referral>,
  ) {
    this.client = new Telegraf<MyContext>(
      this.configService.get('TELEGRAM_API_KEY'),
    );
  }

  async onApplicationBootstrap() {
    try {
      this.pointSystemService = new PointSystemService(this.telegramRepository);
      this.referralService = new ReferralService(
        this.referralRepository,
        this.telegramRepository,
      );
      this.commands = [
        new StartCommand(
          this.client,
          this.telegramRepository,
          this.pointSystemService,
          this.referralService,
          new MenuCommand(this.client, this.telegramRepository),
        ),
        new MenuCommand(this.client, this.telegramRepository),
        new TasksCommand(
          this.client,
          this.telegramRepository,
          this.pointSystemService,
        ),
        new ReferalsCommand(this.client, this.telegramRepository),
        new BalanceCommand(this.client, this.telegramRepository),
        new LeaderboardCommand(this.client, this.telegramRepository),
        new SocialCommand(this.client, this.telegramRepository),
        new LanguageCommand(this.client, this.telegramRepository),
      ];
      for (const command of this.commands) {
        command.handle();
      }

      this.scenes = [];
      for (const scene of this.scenes) {
        scene.handle();
        this.scenesNames.push(scene.scene);
      }
      const stage = new Scenes.Stage(this.scenesNames);
      this.client.use(stage.middleware());

      this.client.launch();
      this.logger.log('Telegram Bot initialized');
      const clients = await this.telegramRepository.find();
      // for (const _client of clients) {
      //   this.client.telegram.sendMessage(_client.chat_id, 'Доступна таблица лидеров\n\nДоступно создание реферальной ссылки и реализована реферальная система(без начисления баллов)\n\n/start')
      // }
    } catch (error) {
      return this.logger.log('Bot Token is required');
    }
  }

  create(createTelegramDto: CreateTelegramDto) {
    return 'This action adds a new telegram';
  }

  findAll() {
    return `This action returns all telegram`;
  }

  findOne(id: number) {
    return `This action returns a #${id} telegram`;
  }

  update(id: number, updateTelegramDto: UpdateTelegramDto) {
    return `This action updates a #${id} telegram`;
  }

  remove(id: number) {
    return `This action removes a #${id} telegram`;
  }
}

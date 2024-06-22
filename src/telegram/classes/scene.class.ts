import { Telegraf } from 'telegraf';
import { BaseScene } from 'telegraf/typings/scenes';
import { MyContext } from '../interfaces/context.interface';

export abstract class Scene {
  public scene: BaseScene<MyContext>;
  constructor(public client: Telegraf<MyContext>) {}

  abstract handle(): void;
}

// import { Referrals } from '../entities/telegram.entity';

export class CreateTelegramDto {
  chat_id: string;

  username: string;

  name: string;

  point_balance: number;

  referrals: number;

  referrals_bonus: number;

  role: 'client' | 'influencer' | 'admin';

  success_tasks: number;
}

import { Referral } from 'src/referral/entities/referral.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Telegram {
  @PrimaryGeneratedColumn()
  id: number; //сгенерированный уникальный id пользователя

  @Column({ type: 'bigint', nullable: true })
  chat_id: string; //id чата пользователя

  @Column({ nullable: true })
  username: string; //никнейм пользователя

  @Column({ nullable: true })
  name: string; //имя пользователя

  @Column({ default: 0 })
  point_balance: number; //баланс пользователя

  @Column({ type: 'bigint', nullable: true })
  referrer: string; //реферальный id пользователя

  @OneToMany(() => Referral, (referral) => referral.referringUser)
  referrals: Referral[]; //ссылочная ячейка для рефералов

  @Column({ default: 0 })
  referrals_bonus: number; //рефералы принесли бонусов

  @Column({ default: 'client' })
  role: 'client' | 'influencer' | 'admin'; //права

  @Column({ default: false })
  task_invite: boolean;

  @Column({ default: false })
  task_twitter: boolean;

  @Column({ default: false })
  task_channel: boolean;

  @Column({ default: false })
  task_chat: boolean;

  @Column({ default: false })
  task_boost: boolean;

  @Column({ default: false })
  task_instructions: boolean;

  @Column({ default: false })
  task_ticker: boolean;
}

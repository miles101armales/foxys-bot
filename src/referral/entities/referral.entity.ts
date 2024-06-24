import { Telegram } from 'src/telegram/entities/telegram.entity';
import { User } from 'telegraf/typings/core/types/typegram';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Referral {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chat_id: string;

  @ManyToOne(() => Telegram, (telegram) => telegram.referrals)
  referredUser1: User;

  @ManyToOne(() => Telegram, (telegram) => telegram.referrals)
  referredUser2: User;

  @ManyToOne(() => Telegram)
  referringUser: User;

  @Column()
  createdAt: Date;
}

import { Telegram } from 'src/telegram/entities/telegram.entity';
import { User } from 'telegraf/typings/core/types/typegram';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Referral {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Telegram, (telegram) => telegram.referrals)
  referredUser: User;

  @ManyToOne(() => Telegram)
  referringUser: User;

  @Column()
  createdAt: Date;
}

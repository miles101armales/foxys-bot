import { Telegram } from 'src/telegram/entities/telegram.entity';
import { User } from 'telegraf/typings/core/types/typegram';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Referral {
  @PrimaryGeneratedColumn()
  id: number; //сгенерированный id реферальной операции

  @Column({nullable: true})
  chat_id: string; // id чата приглашенного пользователя

  @ManyToOne(() => Telegram, (telegram) => telegram.referrals, {nullable:  true})
  referredUser1: User; // приглашенный пользователь

  @Column({default: ''})
  ref_chat_id: string; // id чата корневого пользователя

  @ManyToOne(() => Telegram, { nullable: true })
  referringUser: User; // корневой пользователь

  @Column()
  createdAt: Date; // дата создания операции
}
